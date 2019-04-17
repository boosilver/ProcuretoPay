

## Clone  project
 ~~~
 $ git clone git@git.ng.bluemix.net:KrungsriBlockchain/hyperledger-experimental.git
 ~~~

## Install fabric client SDK v 1.3 from package.json 

~~~
$ cd fabcar
$ npm install
~~~

## How to run
`Setup Envoriment for HyperLedger` <br/>
1.Run start fabric
    
```
$ cd fabcar-channel-base-event
$ ./startFabric3org.sh
```
This command use chaincode from `chaincode_example03/go` and Run ./start.sh in `basic-network-channel-base-event` <br/>

Create Org1 for user1, <br/>
       Org2 for user2, <br/>
       Org4 for user4 <br/>
Create 2 Channel privatechannel1 & privatechannel2 <br/>
       user1 join privatechannel1  <br/>
       user2 join privatechannel2 <br/>
       user4 join privatechannel1 & privatechannel2<br/>
set Aval = 100000, Bval = 0 in Org1,Org2  

`SetUp User` <br/>
2.Run script setupUser

```
$ ./setUpUser.sh  
```
This command run node enrollAdmin.js, node registerUser.js in user1,user2,uer3 to setup User

3.Run user1 (privatechannel1) 

```
 $ cd user1
 $ node invokeEvennumber.js
```
Command to random evenNumber and Transfer Aval to Bval in privatechannel1<br/>
 `Example view console in Org1` <br/>
  "Random money : 2 , sum Random money : 2 <br/>
  "Random money : 4 , sum Random money : 6 <br/>
  "Random money : 8 , sum Random money : 14 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec 


4.Run user2 (privatechannel2)

```
 $ cd user2
 $ node invokeOddnumber.js
```
command to random oddNumber and transfer Aval to Bval in privatechannel2<br/>
 `Example view console in Org2` <br/>
  "Random money : 3 , sum Random money : 3 <br/>
  "Random money : 5 , sum Random money : 8 <br/>
  "Random money : 1 , sum Random money : 9 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec

5.Run Channel-Base-Event (privatechannel1 & privatechannel2)

```
$ cd user4
$ node channel-base-eventCC.js

```
This command run channel-base-eventCC.js for wait chaincode event in privatechannel1 & privatechannel2<br/>
 
 `Example view console in Org4 when run user1` <br/>
  "Random money : 2 , sum Random money : 2 <br/>
  "Random money : 8 , sum Random money : 10 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec <br/>

`Example view console in Org4 when run user 2 `<br/>
  "Random money : 1 , sum Random money : 1 <br/>
  "Random money : 5 , sum Random money : 6 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec <br/>

`Example view console in Org4 when run user1 and user 2`<br/>
  "Random money : 2 , sum Random money : 2 <br/>
  "Random money : 1 , sum Random money : 1 <br/>
  "Random money : 8 , sum Random money : 10 <br/>
  "Random money : 5 , sum Random money : 6 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec <br/>

```
$ cd user4
$ node channel-base-eventTS.js
```
This listener will be notificed of BLOCK INFO (all transactions) <br/>
 `Example view console in Org4 when run user1` <br/>
  "Random money : 2 , sum Random money : 2 <br/>
  "Random money : 8 , sum Random money : 10 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec <br/>

`Example view console in Org4 when run user 2 `<br/>
  "Random money : 1 , sum Random money : 1 <br/>
  "Random money : 5 , sum Random money : 6 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec <br/>

 `Example view console in Org4 when run user1 and user 2`<br/>
  "Random money : 2 , sum Random money : 2 <br/>
  "Random money : 1 , sum Random money : 1 <br/>
  "Random money : 8 , sum Random money : 10 <br/>
  "Random money : 5 , sum Random money : 6 <br/>
  . <br/>
  . <br/>
  . <br/>
All transtraction delay 5 sec 
