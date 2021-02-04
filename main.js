var express = require('express')
var app = express()
var fs = require('fs');
var template = require('./lib/template.js');
var qs = require('querystring');
var bodyParser = require('body-parser');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var compression = require('compression');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); //압축
app.get('*', function(request, response, next){ //next에 middleware가 담겨있다고 생각    불필요한 불러오기를 방지하기 위해 get을 사용(post방식 등에서 방지)   '*' = 들어오는 모든 요청    (들어오는 모든요청이 아닌 get방식으로 들어오는 요청에 대해서만 파일리스트를 가져오는 코드)
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});

//route, routing
// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function(request, response) {
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(request.list);
  var html = template.HTML(title, list,
    `<h2>${title}</h2>${description}`, //template.HTML - control
    `<a href="/create">create</a>` //template.HTML - body
    );
  response.send(html);
});

app.get('/page/:pageId', function(request, response) { // url = page/HTML      pageId = HTML
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = request.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizedDescription = sanitizeHtml(description, {
      allowedTags:['h1']
    });
    var list = template.list(request.list);
    var html = template.HTML(sanitizedTitle, list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      ` <a href="/create">create</a>
        <a href="/update/${sanitizedTitle}">update</a>
        <form action="/delete_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>`
    );
    response.send(html);
  });
});

app.get('/create', function(request, response){
  var title = 'WEB - create';
  var list = template.list(request.list);
  var html = template.HTML(title, list, `
    <form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
  `, '');
  response.send(html);
});

app.post('/create_process', function(request, response) {
  // console.log(request.list);  //불러오지 못함 <undefined> (post라서)  13line 참조
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function(err){
    response.writeHead(302, {Location: `/?id=${title}`});
    response.end();
  })

  // var body = '';
  // request.on('data', function(data){
  //    body = body + data;
  // });
  // request.on('end', function(){
  //   var post = qs.parse(body);
  //   var title = post.title;
  //   var description = post.description;
  //   fs.writeFile(`data/${title}`, description, 'utf8', function(err){
  //     response.writeHead(302, {Location: `/?id=${title}`});
  //     response.end();
  //   })
  // });
});

app.get('/update/:pageId', function(request, response) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = request.params.pageId;
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `
      <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
    );
    response.send(html);
  });
});

app.post('/update_process', function(request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/?id=${title}`)
    })
  });

  // var body = '';
  //     request.on('data', function(data){
  //         body = body + data;
  //     });
  //     request.on('end', function(){
  //         var post = qs.parse(body);
  //         var id = post.id;
  //         var title = post.title;
  //         var description = post.description;
  //         fs.rename(`data/${id}`, `data/${title}`, function(error){
  //           fs.writeFile(`data/${title}`, description, 'utf8', function(err){
  //             response.redirect(`/?id=${title}`)
  //           })
  //         });
  //     });
});

app.post('/delete_process', function(request, response){
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error){
    response.redirect('/');
  });

  // var body = '';
  //     request.on('data', function(data){
  //         body = body + data;
  //     });
  //     request.on('end', function(){
  //         var post = qs.parse(body);
  //         var id = post.id;
  //         var filteredId = path.parse(id).base;
  //         fs.unlink(`data/${filteredId}`, function(error){
  //           response.redirect('/');
  //         })
  //     });
});

// app.listen(3000, () => console.log('Example app listening on port 3000!'))
app.listen(3000, function() { //3000포트
  console.log('Example app listening on port 3000!')
});

/*
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        
      } else {
        
      }
    } else if(pathname === '/create'){
      
    } else if(pathname === '/create_process'){
      
    } else if(pathname === '/update'){
      
    } else if(pathname === '/update_process'){
      
    } else if(pathname === '/delete_process'){
      
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
*/
