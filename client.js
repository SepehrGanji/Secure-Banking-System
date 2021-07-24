require('dotenv').config()
const { io } = require('socket.io-client');
const NodeRSA = require('node-rsa');
const CryptoJS = require('crypto-js');

const HOST = process.env.HOST || "localhost";
const PORT = Number(process.env.PORT) || 3000;
const client = io(`ws://${HOST}:${PORT}`);
const keyData = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiHksjeRBy4tht9m7teCR
KCL17DLyHGmzMsGPaBTJkEnoexjytF8Ye4x3LwSE3UNKHAkOglwGvEKi48xLD5CF
RWgugciXFNHN2zMnWQ5nwR6LJot1tIOZ3eHYG/QLYTjlEsorbQdQnhVKn8z/bJ3O
3qXY4ovSXNssjAkzrtzqdXEZHbm8rEleGT9R5mYTLBZvy5Fx3kS/IJ0qB4jxRqGT
YaAWADjczSV+rpVAhJsW+/WJ1sCRhUpJ8kTGRRew0wh8Xvsa9b/2XMsgxIkxZ7OY
4ATb0w2APtPFdqm+WcatObKnTMTVB2eS9RPAj0vdSFy9NH8v7YkJc59JgSp+81DJ
zQIDAQAB
-----END PUBLIC KEY-----`;
const clientKey = new NodeRSA(keyData);
const sessionKey = CryptoJS.SHA256("9733713" + String(new Date()) + String(process.pid * Math.random())).toString();

client.on('connect', () => {
    console.log("Connected to Server!");
    client.emit('key', clientKey.encrypt(
        sessionKey,
        'base64',
        'utf8'
    ));
});
client.on('disconnect', () => {
   console.error("Disconnected from Server!")
});
client.on('message', message => {
    console.info(receiveMessage(message, sessionKey));
});

process.stdin.on('data', data => {
    sendMessage(client, data, sessionKey);
});

const sendMessage = (socket, message, key) => {
    const cipherText = CryptoJS.AES.encrypt(String(message), key).toString();
    socket.emit('message', cipherText);
};

const receiveMessage = (message, key) => {
    const bytes  = CryptoJS.AES.decrypt(message, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
};
