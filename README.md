# http2mqtt

This is simple as possible! 

* Starts a webserver
* Pass the topic, payload, username, password in request body by json format
* Try to connect to the MQTT Broker when request format is right
* Works only with POST method
* Supports MQTT with tls
* The http api uses basic auth

## How to use

### Run

Clone the repo, add your cert as `./crt.ca.cg.pem`, edit your broker url, http port, broker port, api username, api password in `index.js`.

Use DOCKERFILE to build the image:

```
docker build -t http2mqtt .
```

Run the docker image in docker-compose:

```
docker compose up -d
```

Also you can run the docker image in command line:

```
docker run -it -d -p 127.0.0.1:8080:8080 http2mqtt --restart unless-stopped
```

### Test

Target Url:

```
localhost:[port]
```

Don't forget basic auth {username='xxx', password='xxx'} (you must pass this auth to use this http API) and request body, you should set MQTT topic, MQTT payload, MQTT username, MQTT password in json:

```
{
    "topic": "test-topic",
    "payload": "test-payload",
    "username": "test-username",
    "password": "test-password"
}
```

If you come with something wrong, you will get corresponding error message in the response, if you success to send a MQTT message, you will get success info in the response.
