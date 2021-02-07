const saveTo = "localstorage"; // indexeddb;
class PPOMemory {
  constructor(batchSize) {
    this.states = [];
    this.probs = [];
    this.vals = [];
    this.actions = [];
    this.rewards = [];
    this.dones = [];
    this.batchSize = batchSize;
  }
  getMemory() {
    return [
      this.states,
      this.probs,
      this.vals,
      this.actions,
      this.rewards,
      this.dones,
    ];
  }
  generateBatches() {
    return tf.tidy(() => {
      let nStates = this.states.length;
      let batchStart = tf.range(0, nStates, this.batchSize, "int32").dataSync();
      let indices = tf.range(0, nStates, 1, "int32");
      tf.util.shuffle(indices);
      let batches = [];
      for (let i of batchStart) {
        if (i+this.batchSize <= nStates){
          batches.push(indices.slice(i, this.batchSize));
        }
      }
      return batches;
    });
  }
  storeMemory(state, action, prob, val, reward, done) {
    this.states.push(state);
    this.actions.push(action);
    this.probs.push(prob);
    this.vals.push(val);
    this.rewards.push(reward);
    this.dones.push(done);
  }
  clearMemory() {
    this.states = [];
    this.actions = [];
    this.probs = [];
    this.vals = [];
    this.rewards = [];
    this.dones = [];
  }
}

class ActorNetwork {
  constructor(nActions, inputDims, hDims = [256, 256], chkptDir = "tmp/ppo") {
    this.checkpointFile = chkptDir + "/actor_torch_ppo";
    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({
        units: hDims[0],
        inputShape: inputDims,
      })
    );
    this.model.add(tf.layers.reLU());
    for (let i = 1; i < hDims.length; ++i) {
      this.model.add(tf.layers.dense({ units: hDims[i] }));
      this.model.add(tf.layers.reLU());
    }
    this.model.add(tf.layers.dense({ units: nActions }));
    this.model.add(tf.layers.softmax());
  }
  forward(state) {
    return tf.tidy(() => {
      let dist = this.model.predict(state);
      dist = dist.div(dist.sum());
      return dist;
    });
  }
  async saveCheckpoint() {
    const saveResults = await this.model.save(saveTo + "://actor-model");
    return saveResults;
  }
  async loadCheckpoint() {
    let loadedModel = null;
    try {
      loadedModel = await tf.loadLayersModel(saveTo + "://actor-model");
    } catch (err) {
      return null;
    }
    this.model = loadedModel;
    return loadedModel;
  }
}

class CriticNetwork {
  constructor(inputDims, hDims = [256, 256], chkptDir = "tmp/ppo") {
    this.checkpointFile = chkptDir + "/critic_torch_ppo";
    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({
        units: hDims[0],
        inputShape: inputDims,
      })
    );
    this.model.add(tf.layers.reLU());
    for (let i = 1; i < hDims.length; ++i) {
      this.model.add(tf.layers.dense({ units: hDims[i] }));
      this.model.add(tf.layers.reLU());
    }
    this.model.add(tf.layers.dense({ units: 1 }));
  }
  forward(state) {
    return tf.tidy(() => this.model.predict(state));
  }
  async saveCheckpoint() {
    const saveResults = await this.model.save(saveTo + "://critic-model");
    return saveResults;
  }
  async loadCheckpoint() {
    let loadedModel = null;
    try {
      loadedModel = await tf.loadLayersModel(saveTo + "://critic-model");
    } catch (err) {
      return null;
    }
    this.model = loadedModel;
    return loadedModel;
  }
}

class Agent {
  constructor(
    nActions,
    inputDims,
    batchSize = 64,
    alpha = 0.0003,
    nEpochs = 10,
    gamma = 0.99,
    gaeLambda = 0.95,
    policyClip = 0.2,
    c1 = 0.5
  ) {
    this.gamma = gamma;
    this.policyClip = policyClip;
    this.nEpochs = nEpochs;
    this.gaeLambda = gaeLambda;
    this.c1 = c1;
    this.batchSize = batchSize;

    this.actor = new ActorNetwork(nActions, inputDims);
    this.critic = new CriticNetwork(inputDims);
    this.memory = new PPOMemory(batchSize);
    this.optimizer = tf.train.adam(alpha);
  }
  remember(state, action, probs, vals, reward, done) {
    this.memory.storeMemory(state, action, probs, vals, reward, done);
  }
  async saveModels() {
    let actorSaveResults = await this.actor.saveCheckpoint();
    let criticSaveResults = await this.critic.saveCheckpoint();
    return actorSaveResults != null && criticSaveResults != null;
  }
  async loadModels() {
    let actorLoadedModel = this.actor.loadCheckpoint();
    let criticLoadedModel = this.critic.loadCheckpoint();
    return (actorLoadedModel != null) & (criticLoadedModel != null);
  }
  chooseAction(observation) {
    return tf.tidy(() => {
      let state = tf.tensor([observation], undefined, "float32");
      let dist = this.actor.forward(state);
      let value = this.critic.forward(state);

      let action = tf.multinomial(dist, 1).dataSync()[0];
      let probs = tf.log(dist).gather([action]).dataSync()[0];
      value = value.dataSync()[0];

      return [action, probs, value];
    });
  }
  learn() {
    tf.tidy(() => {
      let states, probs, vals, actions, rewards, dones;
      [states, probs, vals, actions, rewards, dones] = this.memory.getMemory();
      let advantage = tf.buffer([rewards.length]);
      for (let t = 0; t < rewards.length - 2; ++t) {
        let discount = 1;
        let aT = 0;
        for (let k = t; k < rewards.length - 2; ++k) {
          aT +=
            discount *
            (rewards[k] + this.gamma * vals[k + 1] * (1 - dones[k]) - vals[k]);
          discount *= this.gamma * this.gaeLambda;
        }
        advantage.set(aT, t);
      }
      advantage = advantage.toTensor();
      let valsTensor = tf.tensor(vals, undefined, "float32");
      let statesTensor = tf.tensor(states, undefined, "float32");
      let oldProbsTensor = tf.tensor(probs, undefined, "float32");
      let actionsTensor = tf.tensor(actions, undefined, "int32");

      for (let i = 0; i < this.nEpochs; ++i) {
        let batches = this.memory.generateBatches();
        for (let batch of batches) {
          let f = () =>
            tf.tidy(() => {
              let values = valsTensor.gather(batch);
              let states = statesTensor.gather(batch);
              let oldProbs = oldProbsTensor.gather(batch);
              let actions = actionsTensor.gather(batch);
              let batchAdvantage = advantage.gather(batch);
              let dist = this.actor.forward(states);
              let criticValue = this.critic.forward(states);
              criticValue = criticValue.squeeze();
              let buffer = new Array(this.batchSize);
              for (let m = 0; m < this.batchSize; ++m) {
                buffer[m] = dist.gather(m).gather(actions.gather(m));
              }
              let newProbs = tf.stack(buffer).log();
              let probRatio = newProbs.sub(oldProbs).exp();

              let weightedProbs = batchAdvantage.mul(probRatio);
              let weightedClippedProbs = probRatio
                .clipByValue(1 - this.policyClip, 1 + this.policyClip)
                .mul(batchAdvantage);
              let actorLoss = tf
                .minimum(weightedProbs, weightedClippedProbs)
                .mean()
                .mul(-1);
              let returns = batchAdvantage.add(values);
              let criticLoss = returns.sub(criticValue).pow(2).mean();
              let totalLoss = actorLoss.add(criticLoss.mul(this.c1)).mean();
              return totalLoss;
            });
          const batchGradients = this.optimizer.computeGradients(f).grads;
          this.optimizer.applyGradients(batchGradients);
        }
        // add gradients to overall batch
      }
    });
    this.memory.clearMemory();
  }
}
