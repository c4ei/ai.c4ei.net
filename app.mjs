// /app.mjs
import express from 'express';
import ollama from 'ollama'

const app = express();
const port = 3010;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Home route - renders the streaming page
app.get('/', (req, res) => {
  res.render('chat');
});

// Streaming route
app.get('/stream', async (req, res) => {
  const userMessage = req.query.message || '안녕하세요';
  const message = { role: 'user', content: userMessage }
  const response = await ollama.chat({ model: 'llama3.2', messages: [message], stream: true })
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  for await (const part of response) {
    // process.stdout.write(part.message.content)
    res.write(`data: ${part.message.content}`);
  }
  res.end();
});

app.get('/chat', async (req, res) => {
  try {
    const userMessage = req.query.message || '안녕하세요';
    const message = { role: 'user', content: userMessage };
    
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [message], // Pass the message directly
    });
    
    res.send(JSON.stringify(response.message.content));
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
