//const logger = require('../utils/logger');

exports.eventToJsonAttr =  function(event){ 
    //@1 in valible 'event' format is JSON
    //console.log("[valueEvent.eventToArray(event)] Event InputJSON : "+ JSON.stringify(event));
    //var test = [116,114,97,110,102,101,114,95,109,111,110,101,121];
    //@2 Convert JSON to Buffer
    let bufferOriginal = Buffer.from(JSON.parse(JSON.stringify(event)).data); 
    //@3 Convert Buffer to Utf-8 String
    let StringUnicod = bufferOriginal.toString('utf8')
   // console.log('[valueEvent.eventToArray(event)] InputString : '+JSON.stringify(StringUnicod));
    return StringUnicod
    //@4 replace Replace \n\n to \n@
    // let ArrayStringUnicod = StringUnicod.replace('\n\n','\n@').split("\n")
    // //@5 StringUnicod remove \uxxx  & push Array
    // let InputArrayOriginal = [] ; 
    // ArrayStringUnicod.forEach(element => { 
    //     console.log(JSON.stringify(element))
    //     element = element.replace(/[\u0000-\u001F&\u0040&\uFFF0-\uFFFF]+/g,"")
    //     console.log(JSON.stringify(element))
    //     if(element != ""){
    //         InputArrayOriginal.push(element);  
    //     }
    // }); 
    // //@6.1 indexOf funcName is endorse_idf
    // if(InputArrayOriginal.indexOf("endorse_idf") != -1){ 
    //     let pubkey = "" ; 
    //     for(let index = 4; index <= 11; index++){ 
    //         pubkey += `${InputArrayOriginal[index]}\n` 
    //     }
    //     InputArrayOriginal.push(pubkey); 
    //     logger.debug('[valueEvent.eventToArray(event)en] InputArrayOriginal : '+JSON.stringify(InputArrayOriginal));
    //     let json = {
    //         channelName : InputArrayOriginal[0],
    //         chaincodeName : InputArrayOriginal[1],
    //         InvIdentity : InputArrayOriginal[2],
    //         EndorsementIdentity : InputArrayOriginal[3],
    //         PublicKey : InputArrayOriginal[13],
    //         TimeStamp : InputArrayOriginal[12],

    //     }
    //     return json ; 
    // } 

    // logger.debug('[valueEvent.eventToArray(event)] InputArrayOriginal : '+JSON.stringify(InputArrayOriginal));

    // //@6.2 indexOf funcName is create_idf RO create_idf
    
    // if(InputArrayOriginal.indexOf("create_idf") != -1){
    //     let json = {
    //         channelName:  InputArrayOriginal[0],
    //         chaincodeName:  InputArrayOriginal[1],
    //         InvIdentity :  InputArrayOriginal[2],
    //         InvAmount:  InputArrayOriginal[3],
    //     }
    //     return json ; 

    // }

    // if(InputArrayOriginal.indexOf("finance_idf") != -1){
    //     let json = {
    //         channelName:  InputArrayOriginal[0],
    //         chaincodeName:  InputArrayOriginal[1],
    //         InvIdentity: InputArrayOriginal[2],
    //         EndorsementIdentity: InputArrayOriginal[3],
    //         FinanceIdentity: InputArrayOriginal[4],
    //         FinanceRunningNo: InputArrayOriginal[7],
    //         FinanceTime: InputArrayOriginal[6],
    //         InvAmountUsed: InputArrayOriginal[5],
            
    //     }
    //     return json ; 

    // }

     
} 
