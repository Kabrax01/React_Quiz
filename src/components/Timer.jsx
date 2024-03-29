import { useEffect } from "react";
import { useQuiz } from "../contexts/QuizContext";

function Timer() {
  const { secondsRemaining, dispatch } = useQuiz();

  const mins = Math.floor(secondsRemaining / 60);
  const sec = secondsRemaining % 60;

  useEffect(() => {
    const countDown = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);

    return () => clearInterval(countDown);
  }, [dispatch]);

  return (
    <div className="timer">
      {mins < 10 && "0"}
      {mins}:{sec < 10 && "0"}
      {sec}
    </div>
  );
}

export default Timer;
