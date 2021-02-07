var express = require('express')
var app = express()
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet') //보안관련
app.use(helmet());

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); //압축
app.get('*', function(request, response, next){ //next에 middleware가 담겨있다고 생각    불필요한 불러오기를 방지하기 위해 get을 사용(post방식 등에서 방지)   '*' = 들어오는 모든 요청    (들어오는 모든요청이 아닌 get방식으로 들어오는 요청에 대해서만 파일리스트를 가져오는 코드)
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});


app.use('/', indexRouter);
app.use('/topic', topicRouter); // /topic 이므로 topic.js에서는 /topic을 빼야한다


//미들웨어는 순차적으로 실행이 된다 그러므로 404에러처리 미들웨어는 가장 마지막에 위치한다.
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

// app.listen(3000, () => console.log('Example app listening on port 3000!'))
app.listen(3000, function() { //3000포트에서
  console.log('Example app listening on port 3000!')
});