import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPTS = {
  ru: `Ты эксперт создания ОРТ тестов, прочитай и улучши форматирование и содержимое. 
  Если есть математические формулы, оберни их в $ формула $ (если формула в той же строке) или $$ формула $$ (если формула на отдельной строке). 
  Формулы должны быть написаны в формате LaTeX.
  Сохрани все переносы строк и форматирование текста.
  Верни только улучшенный текст, без объяснений.`,

  ky: `Сен ЖРТ тесттерин түзүү боюнча эксперттсиң. Текстти окуп, анын форматын жана мазмунун жакшырт.
  Эгер математикалык формулалар бар болсо, аларды $ формула $ (эгер формула ошол эле сапта болсо) же $$ формула $$ (эгер формула өзүнчө сапта болсо) менен белгиле.
  Формулалар LaTeX форматында жазылышы керек.
  Бардык саптардын ташталышын жана тексттин форматын сакта.
  Жакшыртылган текстти гана кайтар, түшүндүрмөсүз.`
};

export async function POST(req: Request) {
  try {
    const { content, language = 'ru' } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: PROMPTS[language as keyof typeof PROMPTS]
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.7,
    });

    const improvedContent = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content: improvedContent });
  } catch (error) {
    console.error('Error in AI formatting:', error);
    return NextResponse.json(
      { error: 'Failed to process content' },
      { status: 500 }
    );
  }
}
