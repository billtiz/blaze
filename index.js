const { ClusterManager } = require("discord-hybrid-sharding");
const config = require('./src/config.js');
const Logger = require('./src/base/logger.js');

[
  {
    file: "./src/blaze.js",
    token: config.token,
    shards: 1,
    perCluster: 1,
  }
].forEach((client) => {
  new ClusterManager(client.file, {
    restarts: {
      max: 5,
      interval: 1000,
    },
    respawn: true,
    mode: "worker",
    token: client.token,
    totalShards: client.shards || "auto",
    shardsPerClusters: parseInt(client.perCluster) || 2,
  })

    .on("shardCreate", (cluster) => {
      Logger.log(`Launched cluster ${cluster.id}`, "cluster");
    })
    .on("debug", (info) => {
      Logger.log(info, "debug");
    })
    .spawn({ timeout: -1 });
});