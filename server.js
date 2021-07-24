require('dotenv').config();
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const NodeRSA = require('node-rsa');
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js');
const Logger = require('./Logger');
const User = require('./Model/User');
const Account = require('./Model/Account');
const JoinAccount = require('./Model/JoinAccount');
const Transaction = require('./Model/Transaction');

const PORT = Number(process.env.PORT) || 3000;
const io = new Server(PORT);
const keyData = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAiHksjeRBy4tht9m7teCRKCL17DLyHGmzMsGPaBTJkEnoexjy
tF8Ye4x3LwSE3UNKHAkOglwGvEKi48xLD5CFRWgugciXFNHN2zMnWQ5nwR6LJot1
tIOZ3eHYG/QLYTjlEsorbQdQnhVKn8z/bJ3O3qXY4ovSXNssjAkzrtzqdXEZHbm8
rEleGT9R5mYTLBZvy5Fx3kS/IJ0qB4jxRqGTYaAWADjczSV+rpVAhJsW+/WJ1sCR
hUpJ8kTGRRew0wh8Xvsa9b/2XMsgxIkxZ7OY4ATb0w2APtPFdqm+WcatObKnTMTV
B2eS9RPAj0vdSFy9NH8v7YkJc59JgSp+81DJzQIDAQABAoIBACbEBNvpUqc22HMY
7jEjsRftll2ZuxxHChgI02uFPBw4YklVNNv3h0TRCanZZsRTMOH10KFG8sLXSt3a
UhgBvVmR1mQXTpMjZY42YZ7ycJZyzqQMSUsVdseIN5L5J6JePvOvadZ2lXfSJHhw
Cr4XtYOZKJpxjTfDKkw88Oli51akdJlXWXPowRVNMbbz19uBgN7oQi7UOR/Z3g5w
RjrFMcSFwvv5GzVMhJlDI+G/lL1ln9znVeAykpUXgbxuJktRsKVkfxGE+LuXe61+
SLafSErXMRV3Wma3fpX+GSI/DfLgzFeCZeOWhwq7fdhmhJIpI9CIRV5Dy/z+hLJe
fP4DcQECgYEA7DaYnV+V+CowqYNT4EEP/E9vOEHVnndkideYPpBp1B3AfcYiY5gr
VFaG6lkytwvM8nwtf9ISYbW6VNWfZp9h6iz4JOzH3oybJl777XCztPNKok7Em9E3
pwzCc3j44tWO0lY3AG5iny0bgUXA7zCe36joMceUvmbbnsxDqmXC61kCgYEAk+e8
M7eaW0oPxXu/YCRu5zZ64WSt8hHNZFYHE5dd+B5BZyMmG0ciEvEWaCT6tnMmwjlc
kxTnVuoAnPJG20nfnP0+owCpn3ONuBm52Gou4XmpOo2FEjhWaGB87ArTgjI2GtEq
vp9zCfyFYsSWTZMY++LGG26L+E8tedlFq5D1Z5UCgYAFXPf6GsF88PhJ4QF2hgOm
5ubPkC8Zefx+ZLbANOcyObq1IFqHiFzzfUNy7rOIFGyC1O7ziAGC1m10n6UO32+J
sZuwuu+OzgJ3zJBLw9NQuHVpWgB8yTNKR6/ij0yXWeH0RKDbEaaLlqqZNMw8og35
ZgxflPh7mjpCUMD4jXbvgQKBgDoFRSoQk2fOZON2iPuBL1RaZdf3c9krLKR4ruv7
jCxiSgvYmQFIZVCC7ORL5WIfSAwXDn7QS3Qn9bebvzoU/7iJC8JL5z6ayPR4exQv
i1Z+MGm8zH/6Q8NMXpUGJjTD17+rYBZJXIqFWhoFvmSOGNXu/wIR2qy8+rz7A76q
7eoFAoGAQPjuYp6EevDcK1snoj90fN4pj985qemronU1Qffs0FlNxBB9OuJT6dl5
nubmYkPX861qY9V1SwAsPEqKbuEh42Md9rjxyQQBkMzjepqTVMdn9JQMZCl1EuTK
1pq7ScQveVdNtAqZljhtFHu6GJopoh6gHDuNbcUbukf65ZMswWY=
-----END RSA PRIVATE KEY-----`;
const serverKey = new NodeRSA(keyData);

io.on('connect', client => {
   console.log("A new client connected");
   client.uuid = uuidv4();
   Logger(`Client ${client.uuid} Connected`);
   client.on('disconnect', () => {
       Logger(`Client ${client.uuid} Disconnected`);
   });
   client.on('key', key => {
       client.sessionKey = serverKey.decrypt(
           key,
           'utf8'
       );
       Logger(`Client ${client.uuid} Session Key Received`);
   });
   client.on('message', async(message) => {
       const command = receiveMessage(message, client.sessionKey).split(' ');
       command[command.length-1] = command[command.length-1].split('\n')[0];
       switch (command[0].toLowerCase()) {
           case 'signup':
               if(client.user){
                   sendMessage(client, "Already Logged In!", client.sessionKey);
                   break;
               }
               const username = command[1];
               const password = command[2];
               if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)){
                   sendMessage(client, "Weak Password!", client.sessionKey);
                   break;
               }
               const newUser = new User({
                  username,
                  password
               });
               newUser.save().then(res => {
                   sendMessage(client, "Success!", client.sessionKey);
                   Logger(`Success signup with username ${username}`);
               }).catch(e => {
                   sendMessage(client, e, client.sessionKey);
               });
               break;
           case 'login':
               if(client.user){
                   sendMessage(client, "Already Logged In!", client.sessionKey);
                   break;
               }
               const username2 = command[1];
               const password2 = command[2];
               User.findOne({
                   username: username2
               }).then(res => {
                   if(!res){
                       sendMessage(client, "Wrong Credentials!", client.sessionKey);
                       Logger(`Wrong credentials of ${username2}`);
                   }else{
                       if(res.checkPassword(password2)){
                           client.user = {
                               _id: res._id,
                               username: res.username
                           }
                           sendMessage(client, "Success!", client.sessionKey);
                           Logger(`Success Login from ${username2}`);
                       }else{
                           sendMessage(client, "Wrong Credentials!", client.sessionKey);
                           Logger(`Wrong credentials of ${username2}`);
                       }
                   }
               }).catch(e => {
                   sendMessage(client, e, client.sessionKey);
               });
               break;
           case 'create':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               const account_no = Math.floor(Math.random() * 9999999999);
               const newAccount = new Account({
                   account_no: account_no,
                   account_type: command[1],
                   money: command[2],
                   conf_label: command[3],
                   int_label: command[4],
                   owner: client.user._id
               });
               newAccount.save()
                   .then(res => {
                       const currentJoin = new JoinAccount({
                           account_id: res._id,
                           user_name: client.user.username,
                           conf_label: command[3],
                           int_label: command[4],
                           pending: false
                       });
                       currentJoin.save()
                           .then(() => {
                               sendMessage(client, `Success, Account.no: ${account_no}`, client.sessionKey);
                               Logger(`${client.user.username} created account with no.${account_no}`);
                           });
                   })
                   .catch(e => {
                       sendMessage(client, e, client.sessionKey);
                   });
               break;
           case 'join':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               const input_account_no = command[1];
               Account.findOne({
                   account_no: input_account_no
               }).then(res => {
                   if(!res){
                       sendMessage(client, "Account not found!", client.sessionKey);
                       Logger(`${client.user.username} Entered Wrong Account no.`);
                   }else {
                       const newJoin = new JoinAccount({
                           account_id: res._id,
                           user_name: client.user.username
                       });
                       newJoin.save()
                           .then(() => {
                               sendMessage(client, "Request Successfully Submitted!", client.sessionKey);
                               Logger(`${client.user.username} Successfully requested to join ${input_account_no}`);
                           });
                   }
               }).catch(e => {
                   sendMessage(client, e, client.sessionKey);
               });
               break;
           case 'accept':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               const accept_account_no = command[1];
               const accept_username = command[2];
               const accept_conf = command[3];
               const accept_int = command[4];
               Account.findOne({
                   account_no: accept_account_no
               }).then(res => {
                   if(!res || String(res.owner) !== String(client.user._id)){
                       sendMessage(client, "Account not found or has another owner!", client.sessionKey);
                   }else{
                       JoinAccount.findOne({
                           account_id: res._id,
                           user_name: accept_username,
                           pending: true
                       }).then(ja => {
                           ja.pending = false;
                           ja.conf_label = accept_conf;
                           ja.int_label = accept_int;
                           ja.save().then(() => {
                               sendMessage(client, "Success!", client.sessionKey);
                               Logger(`Access to account ${accept_account_no} granted to ${accept_username} with ${accept_conf}, ${accept_int}`);
                           });
                       });
                   }
               }).catch(e => {
                   sendMessage(client, e, client.sessionKey);
               });
               break;
           case 'show_my_account':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               JoinAccount.find({
                   user_name: client.user.username,
                   pending: false
               }).populate('account_id').then(res => {
                   const mappedResponse = res.map(r => {
                       return JSON.stringify({
                           account_no: r.account_id.account_no,
                           account_type: r.account_id.account_type,
                           money: r.account_id.money,
                           account_conf_label: r.account_id.conf_label,
                           user_conf_label: r.conf_label,
                           account_int_label: r.account_id.int_label,
                           user_int_label: r.int_label
                       }, null, '\t');
                   });
                   sendMessage(client, mappedResponse.join(',\n'), client.sessionKey);
               }).catch(e => {
                   sendMessage(client, e, client.sessionKey);
               });
               break;
           case 'show_account':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               const ac_no = command[1];
               const showAccount = await Account.findOne({ account_no: ac_no }).populate('owner');
               if(!showAccount){
                   sendMessage(client, "Wrong Account!", client.sessionKey);
                   break;
               }
               const showJoin = await JoinAccount.findOne({
                   account_id: showAccount._id,
                   user_name: client.user.username,
                   pending: false
               });
               if(!showJoin){
                   sendMessage(client, "Access Denied!", client.sessionKey);
                   break;
               }
               if(readAccess(
                   showAccount.conf_label,
                   showJoin.conf_label,
                   showAccount.int_label,
                   showJoin.int_label
               )){
                   const prettyResponse = JSON.stringify({
                       type: showAccount.account_type,
                       created: showAccount.created_at,
                       money: showAccount.money,
                       owner: showAccount.owner.username
                   }, null, '\t');
                   const accountTrans = await Transaction.find().or([
                       { from: ac_no },
                       { to: ac_no }
                   ]).sort({ created_at: 'desc' }).limit(10);
                   const prettyTrans = JSON.stringify(accountTrans, null, '  ');
                   sendMessage(client, prettyResponse + '\nTransactions:\n' + prettyTrans, client.sessionKey);
               }else{
                   sendMessage(client, "Access Denied!", client.sessionKey);
                   break;
               }
               break;
           case 'deposit':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               const dep_from = command[1];
               const dep_to = command[2];
               const my_amount = command[3];
               const fromAccount = await Account.findOne({ account_no: dep_from });
               if(!fromAccount){
                   sendMessage(client, "Wrong from Account!", client.sessionKey);
                   break;
               }
               const toAccount = await Account.findOne({ account_no: dep_to });
               if(!toAccount){
                   sendMessage(client, "Wrong to Account!", client.sessionKey);
                   break;
               }
               const dep_JoinRecord = await JoinAccount.findOne({
                   user_name: client.user.username,
                   account_id: fromAccount._id,
                   pending: false
               });
               if(!dep_JoinRecord){
                   sendMessage(client, "Access Denied!", client.sessionKey);
                   break;
               }
               if(writeAccess(
                   fromAccount.conf_label,
                   dep_JoinRecord.conf_label,
                   fromAccount.int_label,
                   dep_JoinRecord.int_label
               )){
                   if(fromAccount.money < my_amount){
                       sendMessage(client, "You don't have enough money!", client.sessionKey);
                   }else{
                       fromAccount.money -= my_amount;
                       toAccount.money += my_amount;
                       await fromAccount.save();
                       await toAccount.save();
                       const dep_trans = new Transaction({
                           from: dep_from,
                           to: dep_to,
                           user: client.user.username,
                           amount: my_amount
                       });
                       await dep_trans.save();
                       sendMessage(client, "Success!", client.sessionKey);
                   }
               }else{
                   sendMessage(client, "Access Denied!", client.sessionKey);
                   break;
               }
               break;
           case 'withdraw':
               if(!client.user){
                   sendMessage(client, "You must login!", client.sessionKey);
                   break;
               }
               const with_from = command[1];
               const with_amount = command[2];
               const currentAccount = await Account.findOne({ account_no: with_from });
               if(!currentAccount){
                   sendMessage(client, "Wrong Account!", client.sessionKey);
                   break;
               }
               const joinRecord = await JoinAccount.findOne({
                   user_name: client.user.username,
                   account_id: currentAccount._id,
                   pending: false
               });
               if(!joinRecord){
                   sendMessage(client, "Wrong Account!", client.sessionKey);
                   break;
               }
               if(writeAccess(
                   currentAccount.conf_label,
                   joinRecord.conf_label,
                   currentAccount.int_label,
                   joinRecord.int_label
               )){
                   if(currentAccount.money < with_amount) sendMessage(client, "You don't have enough money!", client.sessionKey);
                   else{
                       currentAccount.money -= with_amount;
                       await currentAccount.save();
                       const with_trans = new Transaction({
                           from: with_from,
                           user: client.user.username,
                           amount: with_amount
                       });
                       await with_trans.save();
                       sendMessage(client, "Success!", client.sessionKey);
                   }
               }else{
                   sendMessage(client, "Access Denied!", client.sessionKey);
               }
               break;
           case 'logout':
               if(!client.user){
                   sendMessage(client, "You are not logged in!", client.sessionKey);
                   break;
               }
               Logger(`Client ${client.uuid} logged out from ${client.user.username}`);
               client.user = undefined;
               sendMessage(client, "Bye for now!", client.sessionKey);
               break;
           default:
               sendMessage(client, "Invalid Command!", client.sessionKey);
       }
   });
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

const readAccess = (oConf, sConf, oInt, sInt) => {
    Logger(`Read Access Control ${oConf}:${sConf} & ${oInt}:${sInt}`);
    const confEnum = ["TS", "S", "C", "U"];
    const intEnum = ["VT", "T", "ST", "U"];
    const BLP = (confEnum.indexOf(sConf) <= confEnum.indexOf(oConf));
    const BiBa = (intEnum.indexOf(sInt) >= intEnum.indexOf(oInt));
    return (BLP && BiBa);
};

const writeAccess = (oConf, sConf, oInt, sInt) => {
    Logger(`Write Access Control ${oConf}:${sConf} & ${oInt}:${sInt}`);
    const confEnum = ["TS", "S", "C", "U"];
    const intEnum = ["VT", "T", "ST", "U"];
    const BLP = (confEnum.indexOf(sConf) >= confEnum.indexOf(oConf));
    const BiBa = (intEnum.indexOf(sInt) <= intEnum.indexOf(oInt));
    return (BLP && BiBa);
};

mongoose.connect(
    process.env.DBADREDD,
    {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    console.log(`Listening on port ${PORT}`);//TODO
}).catch(e => {
    console.error("Failed!");//TODO
    process.exit(-1);
});
