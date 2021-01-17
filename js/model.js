class Model {
  constructor() {}
}

class Agent {}

class Actor {}

class Critic {}

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
    let batchStart = tf.range(0, nStates, this.batchSize);
    let indices = tf.range(0, nStates, 1, "int32");
    tf.util.shuffle(indices);
    let batches = [];
    for (let i of batchStart) {
      batches.push(indices.slice(i, this.batchSize));
    }
    return [
      tf.tensor(this.states),
      tf.tensor(this.actions),
      tf.tensor(this.probs),
      tf.tensor(this.vals),
      tf.tensor(this.rewards),
      tf.tensor(this.dones),
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
    this.actor = tf.sequential({
      layers: [
        tf.layers.dense({
          units: fc1Dims,
          batchInputShape: inputDims,
        }),
        tf.layers.reLU(),
        tf.layers.dense(fc2Dims),
        tf.layers.reLU(),
        tf.layers.dense(nActions),
        tf.layers.softmax(),
      ],
    });
    this.optimizer = tf.train.adam(alpha);
  }
  forward(state) {
    dist = this.actor(state);
    return dist;
  }
  saveCheckpoint() {}
  loadCheckpoint() {}
}

class CriticNetwork {
  constructor(
    inputDims,
    alpha,
    fc1Dims = 256,
    fc2Dims = 256,
    chkpt_dir = "tmp/ppo"
  ) {
    this.checkpointFile = chkptDir + "/critic_torch_ppo";
    this.critic = tf.sequential({
      layers: [
        tf.layers.dense(),
        tf.layers.reLU(),
        tf.layers.dense(fc2Dims),
        tf.layers.reLU(),
        tf.layers.dense(1),
      ],
    });
    this.optimizer = tf.optimizer.adam(alpha);
  }
  forward(state) {
    value = self.critic(state);
    return value;
  }
  saveCheckpoint() {}
  loadCheckpoint() {}
}

class Agent {
  constructor(
    nActions,
    inputDims,
    gamma = 0.99,
    alpha = 0.0003,
    gaeLambda = 0.95,
    policyClip = 0.2,
    batchSize = 64,
    nEpochs = 10
  ) {
    this.gamma = gamma;
    this.policyClip = policyClip;
    this.nEpochs = nEpochs;
    this.gaeLambda = gaeLambda;

    this.actor = ActorNetwork(nActions, inputDims, alpha);
    this.critic = CriticNetwork(inputDims, alpha);
    this.memory = PPOMemory(batchSize);
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
    state = tf.tensor(observation, undefined, "float32");
    dist = this.actor.forward(state);
    value = this.critic.forward(state);
    action = tf.multinomial(dist, 1);
    probs = 
  }
}
