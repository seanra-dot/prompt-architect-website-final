import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

app.post("/enhance", async (req, res) => {

    try {

        const { prompt } = req.body;

        const fullPrompt = `
당신은 전문 AI 프롬프트 엔지니어입니다.

반드시 자연스러운 한국어로만 답변하세요.
영어는 절대 사용하지 마세요.

사용자의 프롬프트를:
- 더 구체적으로 개선
- 구조화
- 스타일 강화
- 카메라/조명/구도 개선
- 네거티브 프롬프트 추가

하세요.

답변 형식은 반드시 아래 형식을 따르세요.

[개선된 프롬프트]
...

[개선 포인트]
- ...
- ...

사용자 프롬프트:
${prompt}
`;

        let result;

        for (let i = 0; i < 5; i++) {

            try {

                result = await model.generateContent(fullPrompt);
                break;

            } catch (error) {

                console.log(`재시도 ${i + 1} 실패`);

                if (i === 4) {
                    throw error;
                }

                await new Promise(resolve =>
                    setTimeout(resolve, 5000 * (i + 1))
                );
            }
        }

        const response =
            await result.response;

        const text =
            response.text();

        res.json({
            result: text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `서버 실행중: ${PORT}`
    );
});