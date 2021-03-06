var express = require('express');
const _ = require('lodash');
const kubernetesClient = require('./kubernetes-client');
const fs = require("fs");
const clusterInfo = require("../config/ibmcloud-config.json");

module.exports = function (app) {

    var router = express.Router();

    router.get('/', function (req, res, next) {

        // Check if we are running locally
        if (process.env.npm_lifecycle_event === "dev") {
            res.json(clusterInfo);
        } else {
            try {
                const client = kubernetesClient();
                client.api.v1.namespace(process.env.NAMESPACE || 'tools').configmaps('ibmcloud-config').get()
                    .then(result => {
                        console.log('Got result: ', result.body.data);
                        return result.body.data;
                    }, error => {
                        console.error('Error reading config maps: ', error);
                        return {};
                    })
                    .then(data => {
                        res.json(data);
                    });
            } catch (err) {
                console.error('Error getting kubernetes client: ', err);
                res.json({});
            }
        }

    });

    // Define API to retrieve Cluster information
    app.use("/cluster", router);
}
