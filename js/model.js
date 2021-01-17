function getIndicesOfTensor(tensor, indices) {

}
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
  generateBatches() {
    let nStates = this.states.length;
    let batchStart = tf.range(0, nStates, this.batchSize).dataSync();
    let indices = tf.range(0, nStates, 1, "int32");
    tf.util.shuffle(indices);
    let batches = [];
    for (let i of batchStart) {
      batches.push(indices.slice(i, this.batchSize));
    }
    return [
      this.states,
      this.actions,
      this.probs,
      this.vals,
      this.rewards,
      this.dones,
      batches,
    ];
  }
  storeMemory(state, action, probs, vals, reward, done) {
    this.states.push(state);
    this.actions.push(action);
    this.probs.append(probs);
    this.vals.push(vals);
    this.rewards.push(reward);
    this.dones.push(done);
  }
  clearMemory() {
    this.states = [];
    this.probs = [];
    this.vals = [];
    this.actions = [];
    this.rewards = [];
    this.dones = [];
  }
}

class ActorNetwork {
  constructor(
    nActions,
    inputDims,
    alpha,
    fc1Dims = 256,
    fc2Dims = 256,
    chkptDir = "tmp/ppo"
  ) {
    this.checkpointFile = chkptDir + "/actor_torch_ppo";
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: fc1Dims,
          inputShape: inputDims,
        }),
        tf.layers.reLU(),
        tf.layers.dense({ units: fc2Dims }),
        tf.layers.reLU(),
        tf.layers.dense({ units: nActions }),
        tf.layers.softmax(),
      ],
    });
    this.optimizer = tf.train.adam(alpha);
  }
  forward(state) {
    let dist = this.model.predict(state);
    let sum = tf.sum(dist);
    dist = dist.div(sum)

    return dist;
  }
  saveCheckpoint() { }
  loadCheckpoint() { }
}

class CriticNetwork {
  constructor(
    inputDims,
    alpha,
    fc1Dims = 256,
    fc2Dims = 256,
    chkptDir = "tmp/ppo"
  ) {
    this.checkpointFile = chkptDir + "/critic_torch_ppo";
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: fc1Dims,
          inputShape: inputDims,
        }),
        tf.layers.reLU(),
        tf.layers.dense({ units: fc2Dims }),
        tf.layers.reLU(),
        tf.layers.dense({ units: 1 }),
      ],
    });
    this.optimizer = tf.train.adam(alpha);
  }
  forward(state) {
    let value = this.model.predict(state);
    return value;
  }
  saveCheckpoint() { }
  loadCheckpoint() { }
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
    c1 = 0.5,
  ) {
    this.gamma = gamma;
    this.policyClip = policyClip;
    this.nEpochs = nEpochs;
    this.gaeLambda = gaeLambda;
    this.c1 = c1;

    this.actor = new ActorNetwork(nActions, inputDims, alpha);
    this.critic = new CriticNetwork(inputDims, alpha);
    this.memory = new PPOMemory(batchSize);
    this.optimizer = tf.train.adam(alpha);
  }
  remember(state, action, probs, vals, reward, done) {
    this.memory.storeMemory(state, action, probs, vals, reward, done);
  }
  saveModels() {
    this.actor.saveCheckpoint();
    this.critic.saveCheckpoint();
  }
  loadModels() {
    this.actor.loadCheckpoint();
    this.critic.loadCheckpoint();
  }
  chooseAction(observation) {
    let state = tf.tensor([observation], undefined, "float32");
    let dist = this.actor.forward(state);
    let value = this.critic.forward(state);

    let action = tf.multinomial(dist, 1).dataSync()[0];
    let probs = tf.log(dist).dataSync()[action];
    value = value.dataSync()[0];

    return [action, probs, value];
  }
  learn() {
    for (let i = 0; i < this.nEpochs; ++i) {
      const f = () => {
        let stateArr, actionArr, oldProbArr, valsArr, rewardArr, donesArr, batches;
        [stateArr, actionArr, oldProbArr, valsArr, rewardArr, donesArr, batches] = this.memory.generateBatches();
        let advantage = new Array(rewardArr.length).fill(0);
        for (let t = 0; t < rewardArr.length - 2; ++t) {
          discount = 1
          aT = 0
          for (let k = t; k < rewardArr.length - 2; ++k) {
            aT += discount * (rewardArr[k] + this.gamma * valsArr[k + 1] * (1 - donesArr[k]) - valsArr[k]);
            discount *= this.gamma * this.gaeLambda;
          }
          advantage[t] = aT;
        }
        advantage = tf.tensor(advantage);
        let values = tf.tensor(valsArr);
        for (let batch of batches) {
          let states = tf.tensor(stateArr.gather(batch), undefined, "float32");
          let oldProbs = tf.tensor(oldProbArr.gather(batch), undefined);
          let actions = tf.tensor(actionArr.gather(batch));

          let dist = this.actor.forward(states);
          let criticValue = this.critic.forward(states);
          criticValue = tf.squeeze(criticValue);
          let newProbs = dist.gather(actions).log();
          let probRatio = newProbs.sub(oldProbs).exp();
          let weightedProbs = advantage.gather(batch).mul(probRatio);
          let weightedClippedProbs = probRatio.clipByValue(1 - this.policyClip, 1 + this.policyClip).mul(advantage[batch]);
          let actorLoss = tf.min(weightedProbs, weightedClippedProbs).mul(-1).mean();
          let returns = advantage.gather(batch) + values.gather(batch);
          let criticLoss = returns.sub(criticValue).pow(2);
          criticLoss = criticLoss.mean();
          let totalLoss = actorLoss.add(criticLoss.mult(this.c1));
          return totalLoss;
          // reset optimizer gradients to zero
          // apply gradients
          // step optimizers forward
        }
      }

      // train per network


      // train on all variables
      const {value, grads} = tf.variableGrads(f);
      this.optimizer.applyGradients(grads);
      // this.critic.optimizer.applyGradients(grads);
    }
    this.memory.clearMemory();
  }
}
