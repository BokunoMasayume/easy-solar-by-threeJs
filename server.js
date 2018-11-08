var websocket = require('faye-websocket'),
    http      = require('http'),
    fs        = require('fs'),
    url       = require('url');


//放着记一下
//ps aux | grep node 查看进程PID
//kill -9 PID 杀掉node server的进程


//createServer方法其实本质上也是为http.Server对象添加了一个request事件监听
//server = new http.Server() ;server.on('request' , function);
//  ==
//server = http.createServer(function);

var server = http.createServer( function(req , res){
  //访问localhost:8888 会执行
  //或者说有request请求会执行
  //等价于server.on('request' , callback);
  //websocket不是request请求

  console.log("create server");
});
var clients = [];
var clientsImage = [];
var clientsVoice = [];

server.on('request', function(req , res) {
  console.log("server on request");
  if(req.url == '/'){
  // fs.readFile('./nodeserver.html' , function(err , data) {
  fs.readFile('./solar.html' , function(err , data) {
    // console.log('输出source.html!!!!!!!!!!!!');
    if(err) {
      res.writeHead(500 , {"Content-Type" : "text/plain"});
      res.write(err+"\n");
      res.end();
    } else {
      res.writeHead(200 , {'Content-Type' : 'text/html;charset=utf-8'});
      res.write(data);
      res.end();
    }
  });
}//if
  // if(req.url == '/three.js'){
  //   fs.readFile('./three.js' , function(err , data) {
  //   // console.log('输出source.html!!!!!!!!!!!!');
  //   if(err) {
  //     res.writeHead(500 , {"Content-Type" : "text/plain"});
  //     res.write(err+"\n");
  //     res.end();
  //   } else {
  //     res.writeHead(200 , {'Content-Type' : 'text/html;charset=utf-8'});
  //     res.write(data);
  //     res.end();
  //   }
  // });
  // }
  else{
    var filePath = '.'+req.url;
    console.log("."+req.url);
    fs.readFile(filePath , function(err , data) {
    // console.log('输出source.html!!!!!!!!!!!!');
    if(err) {
      res.writeHead(500 , {"Content-Type" : "text/plain"});
      res.write(err+"\n");
      res.end();
    } else {
      res.writeHead(200 , {'Content-Type' : 'text/html;charset=utf-8'});
      res.write(data);
      res.end();
    }
  });
  }

  // if(req.url == '/STXingkai_Regular.json'){
  //   fs.readFile('./STXingkai_Regular.json' , function(err , data) {
  //   // console.log('输出source.html!!!!!!!!!!!!');
  //   if(err) {
  //     res.writeHead(500 , {"Content-Type" : "text/plain"});
  //     res.write(err+"\n");
  //     res.end();
  //   } else {
  //     res.writeHead(200 , {'Content-Type' : 'text/html;charset=utf-8'});
  //     res.write(data);
  //     res.end();
  //   }
  // });
  // }


});

server.on('upgrade', function(request ,socket , body) {
  console.log("http upgrade");
  if(websocket.isWebSocket(request)) {
    var ws = new websocket(request , socket , body);

    ws.on('open', function(event){
      // clients.push(ws);
      console.log("open a  ws");
    })
    ws.on('message' , function(event) {
      console.log("clients length : " + clients.length);

      var obj = JSON.parse(event.data);

      if(obj.type == "comein"){
        ws.nickname = obj.author;
        ws.itype = "text";
        clients.push(ws);
        obj.data = clients.length;
        clients.forEach(function(thews , i ,cli) {
          thews.send(JSON.stringify(obj));
        });
      }else if (obj.type == "comeinImg") {
        ws.nickname = obj.author;
        ws.itype = "image";
        clientsImage.push(ws);
      }else if (obj.type == "comeinVic") {
        ws.nickname = obj.author;
        ws.itype = "voice";
        clientsVoice.push(ws);
      }else if (obj.type == "text"){
        clients.forEach(function(thews , i ,cli) {
          thews.send(event.data);
        });
      }else if (obj.type == "voice") {
        clientsVoice.forEach(function(thews , i ,cli) {
          thews.send(event.data);
        });
      }else {
        clientsImage.forEach(function(thews , i ,cli) {
          thews.send(event.data);
        });
      }




      // if(event.data.substr(event.data.indexOf(":")+2 ,5)==="data:"){
      //   console.log('message',event.data.substr(0,event.data.indexOf(":")+1),"an image");
      // } else {
      //   console.log('message',event.data);
      //
      // }

      if(obj.type == "text"){
        console.log('message',obj.author , obj.data);
      }else{
        console.log('message' , obj.author,obj.type);
      }

    });

    ws.on('close' , function(event) {
      console.log('close', event.code , event.reason);

      if(ws.itype == "text"){
        clients = clients.filter(function(thews){
          return thews !== ws;
        });

        clientsImage = clientsImage.filter(function(thews){
          return thews !== ws;
        });

        clientsVoice = clientsVoice.filter(function(thews){
          return thews !== ws;
        });

        clients.forEach(function(thews) {
          var obj = new Object();
          obj.type =  "comeout";
          obj.data = clients.length;
          obj.author = ws.nickname;
          thews.send(JSON.stringify(obj));
        });
        console.log("clients length : " + clients.length);
    }
      ws = null;
    });
  }
});

server.listen(8887);
console.log("start at 8887!");
