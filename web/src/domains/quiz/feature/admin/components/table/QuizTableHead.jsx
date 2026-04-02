import { QUIZ_TABLE } from "@/domains/quiz/config/quizTable.config.js";

const QuizTableHead = () => (
  <tr>
    {QUIZ_TABLE.map((col) => <th key={col}>{col}</th>)}
  </tr>
);

export default QuizTableHead;
