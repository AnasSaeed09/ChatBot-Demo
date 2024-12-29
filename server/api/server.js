import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import OpenAI from 'openai'

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


const app = express();
app.use(cors());
app.use(express.json());

app.get('/',async(req, res) =>{
    res.status(200).send({
        message: 'Hello from ChatBot!'
    })
});

app.post('/',async (req, res) =>{
    try{
        const {prompt} = req.body;

        if(!prompt){
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role:"system", content:"You are a helpful assistant." },
                { role:"user",content: prompt }
            ],
            temperature: 0.77,
            max_completion_tokens: 503,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0
          });

          const botResponse = response?.choices?.[0]?.message?.content;
         if (!botResponse) {
            return res.status(500).json({ error: 'Invalid response from OpenAI' });
        }
      res.status(200).json({ bot: botResponse });
    } catch(error){
        console.error(error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
});

// app.listen(5000, () => console.log('AI server started on http://localhost:5000'));
export default app;
