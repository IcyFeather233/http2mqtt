'use strict'

const restify = require('restify')
const mqtt = require('mqtt')
const fs = require('fs')
const path = require('path')
const auth = require('http-auth')
const authConnect = require("http-auth-connect");

const TRUSTED_CA_LIST = fs.readFileSync(path.join(__dirname, '/crt.ca.cg.pem'))
const brokerUrl     = 'xxx'
const httpPort      = xxx
const brokerPort    = xxx
const apiUsername   = "xxx"
const apiPassword   = "xxx"

const hintmsg = "Request Format ERROR!\ntopic, payload, username, password are all required in your body by json format."

const basic = auth.basic({
    realm: "http2mqtt" // Project Name
}, function (username, password, callback) { // Custom authentication method.
    callback(username === apiUsername && password === apiPassword);
});

const server = restify.createServer();
server.use(authConnect(basic));
server.use(restify.plugins.bodyParser({ mapParams: false }));

server.get('/', controller);
server.post('/', controller);

function startHttpServer() {
    server.listen(httpPort, function() {
        console.log('%s listening at %s', server.name, server.url);
    });
}

startHttpServer();

console.log(`Http server started.`)


function controller(req, res, next) {
  let message = req.body
  if (message === undefined) {
    console.log(hintmsg)
    res.send(hintmsg) 
    res.end()
    return
  }

  let topic = message.topic
  let payload = message.payload
  let mqttUsername = message.username
  let mqttPassword = message.password

  if (topic === undefined || payload  === undefined || mqttUsername  === undefined || mqttPassword  === undefined) {
    console.log(hintmsg)
    res.send(hintmsg)
    res.end()
    return
  }

  const options = {
    useSSL: true,
    port: brokerPort,
    host: brokerUrl,
    protocolId: 'MQTT',
    rejectUnauthorized: false,
    // The CA list will be used to determine if server is authorized
    ca: TRUSTED_CA_LIST,
    protocol: 'mqtts',
    username: mqttUsername,
    password: mqttPassword,
    connectTimeout: 4000
  }

  const mqttClient  = mqtt.connect('mqtts://xxx:8883/', options)

  console.log(`User: ${(mqttUsername === '') ? 'anonymous' : mqttUsername}, you are trying to connect broker ${brokerUrl} ...`)

  mqttClient.on('connect', function (connack) {
    console.log(`MQTT broker ${brokerUrl} connected.`)

    mqttUsername = (mqttUsername === '') ? 'anonymous' : mqttUsername
    console.log(`User: ${mqttUsername} login.`)

    mqttClient.publish(topic, payload, () => {
        console.log(new Date(), `published: ${topic} - ${payload}`)
        res.send('MQTT message is sent sucessfully.');
        res.end()
        next();
    })

    mqttClient.end()

    console.log(`User: ${(mqttUsername === '') ? 'anonymous' : mqttUsername}, you logged out from ${brokerUrl}.`)
  })

  mqttClient.on('error', function (error) {
    // console.log(error)
    console.log(`User: ${mqttUsername}, you cannot connect to MQTT broker.`)
    res.send(`User: ${mqttUsername}, you cannot connect to MQTT broker.`)
    res.end()

    mqttClient.end()

    console.log(`User: ${(mqttUsername === '') ? 'anonymous' : mqttUsername}, you stopped your connecting trying.`)
  })
}


