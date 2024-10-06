// /app.mjs
import express from 'express';
import ollama from 'ollama'
import compression from'compression';


const app = express();
const port = 3010;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(compression());


// Home route - renders the streaming page
app.get('/', (req, res) => {
  res.render('chat');
});

// Streaming route /app.mjs
app.get('/stream', async (req, res) => {
  const userMessage = req.query.message || '안녕하세요';
  const message = { role: 'user', content: userMessage };
  const response = await ollama.chat({ model: 'llama3.2', messages: [message], stream: true });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullMessage = '';  // 전체 메시지를 저장할 변수

  for await (const part of response) {
    fullMessage += part.message.content;  // 메시지 조각을 계속 추가
  }

  // 줄바꿈 문자를 HTML의 <br>로 변환
  fullMessage = fullMessage.replace(/\n/g, '<br>');  // 모든 줄바꿈을 <br>로 바꾸기

  res.write(`data: ${fullMessage}\n\n`);  // 한 번에 전송
  res.end();
});

// /app.mjs
app.get('/chat', async (req, res) => {
  try {
    const userMessage = req.query.message || '안녕하세요';
    const message = { role: 'user', content: userMessage };
    
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [message], // Pass the message directly
    });

    // ollama.chat() 메서드가 반환하는 데이터를 직접 사용
    const assistantMessage = response.message.content;

    // 줄바꿈을 HTML에서 표현할 수 있도록 변환
    const formattedMessage = assistantMessage.replace(/\n/g, '<br>');

    // JSON으로 응답 보내기
    res.send(JSON.stringify(formattedMessage));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving chat result');
  }
});


// // Non-streaming route (returns result all at once)
// app.get('/chat', async (req, res) => {
//   try {
//     const message = { role: 'user', content: '왜 하늘은 파래?' };
//     const response = await ollama.chat({ model: 'llama3.2', messages: [message] });

//     let fullResponse = '';
//     for (const part of response) {
//       fullResponse += part.message.content;
//     }

//     res.send(fullResponse);  // Sends the entire result at once
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error retrieving chat result');
//   }
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
