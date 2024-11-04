// /app.mjs
import express from 'express';
import ollama from 'ollama'
import compression from 'compression';
import axios from 'axios'; // for HTTP requests to Llama 3.2

// import openai

// openai.base_url = "http://localhost:11434/v1"
// openai.api_key = 'ollama'

// response = openai.chat.completions.create(
// 	model="llama3.1",
// 	messages=messages,
// 	tools=tools,
// )

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

app.get('/i', (req, res) => {
  res.render('index');
});

// Route to handle the request
app.post('/get-result', async (req, res) => {
  const { inputText, streaming } = req.body;
  const llamaUrl = 'http://119.202.171.43:11434/api/chat'; // Update with Llama IP and port

  // Check if streaming is enabled
  if (streaming) {
      const clientId = req.query.clientId || Math.random().toString(36).substring(2);

      // Send headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      try {
          // Stream the results
          const llamaStream = await axios({
              method: 'POST',
              url: llamaUrl,
              data: { input: inputText },
              responseType: 'stream',
          });

          llamaStream.data.on('data', chunk => {
              res.write(`data: ${chunk.toString()}\n\n`);
          });

          llamaStream.data.on('end', () => {
              res.write(`data: [END]\n\n`);
              res.end();
          });
      } catch (error) {
          res.write(`data: Error: ${error.message}\n\n`);
          res.end();
      }
  } else {
      // Non-streaming request
      try {
          const response = await axios.post(llamaUrl, { input: inputText });
          res.json(response.data);
      } catch (error) {
          res.status(500).send(`Error: ${error.message}`);
      }
  }
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
