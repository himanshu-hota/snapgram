import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {

const navigate = useNavigate();


  return (
    <div className="flex flex-col w-full h-screen justify-center items-center gap-4 text-2xl">
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Button
        variant={"ghost"}
        type="submit"
        className="shad-button_primary whitespace-nowrap text-xl"
        onClick={() => navigate("/")}
      >
        Go to home
      </Button>
    </div>
  );
};

export default NotFound;
