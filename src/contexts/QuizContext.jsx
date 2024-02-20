import { createContext, useContext, useEffect, useReducer } from "react";
import data from "./questions.json";

const SEC_PER_QUESTION = 30;

const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highScore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataRecived": {
      return { ...state, questions: action.payload, status: "ready" };
    }
    case "dataFailed": {
      return { ...state, status: "error" };
    }
    case "start": {
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SEC_PER_QUESTION,
      };
    }
    case "newAnswer": {
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    }
    case "nextQuestion": {
      return { ...state, index: state.index + 1, answer: null };
    }
    case "finish": {
      return {
        ...state,
        status: "finished",
        highScore:
          state.points > state.highScore ? state.points : state.highScore,
      };
    }
    case "reset": {
      return {
        ...state,
        index: 0,
        answer: null,
        points: 0,
        status: "ready",
        secondsRemaining: null,
      };
    }
    case "tick": {
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    }
    default: {
      return { ...state };
    }
  }
}

const QuizContext = createContext();

function QuizProvider({ children }) {
  const [
    { questions, status, index, answer, points, highScore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((acc, cur) => acc + cur.points, 0);

  useEffect(() => {
    async function fetchData() {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(
          "https://react-quiz-201db-default-rtdb.europe-west1.firebasedatabase.app/questions.json"
        );

        if (!res.ok) throw new Error("Bad server response");
        const data = await res.json();

        dispatch({ type: "dataRecived", payload: data });
      } catch (error) {
        dispatch({ type: "dataFailed" });
        console.error(error);
      } finally {
        dispatch({ type: "ready" });
      }
    }

    fetchData();
  }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        numQuestions,
        maxPossiblePoints,
        status,
        index,
        answer,
        points,
        highScore,
        secondsRemaining,
        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error("quizContext was used outside of QuizProvider");
  return context;
}

export { QuizProvider, useQuiz };
