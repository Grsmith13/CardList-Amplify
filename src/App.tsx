import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { SearchPage } from "./SearchPage";
import { CollectionPage } from "./CollectionPage";
import "./App.css";
import { fetchAndStore, getData } from "./components/CreateCache";
import { deleteAllCardsFromBinder } from "./components/DeleteAllCards";

interface AppProps {
  isGuest: boolean;
  setButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

function App({ isGuest, setButtonVisible }: AppProps) {
  console.log("isGuest =", isGuest);
  useEffect(() => {
    if (isGuest === false) {
      setButtonVisible(false);
    }
    fetchAndStore();
  }, []);
  console.log(getData("Dark Magician"));
  const { signOut, user } = useAuthenticator();
  const [currentPage, setCurrentPage] = useState<string>("collection");

  const renderPage = () => {
    if (currentPage === "search") {
      return <SearchPage />;
    }

    return <CollectionPage isGuest={isGuest} />;
  };

  const handleSignOut = async () => {
    if (isGuest) {
      await deleteAllCardsFromBinder(); // delete cards before sign out
      setButtonVisible(true); // this doesn't need await if it's just a state setter
      await signOut(); // clear the Cognito session
      window.location.reload(); // if needed
    } else {
      setButtonVisible(true);
      await signOut();
    }

    // Optional: reset guest state or refresh the page

    // window.location.reload(); // if needed
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <div className="auth-header-bar">
        {user && <button onClick={() => handleSignOut()}>Sign out</button>}
        <button onClick={() => setCurrentPage("search")}>Search Cards</button>
        <button onClick={() => setCurrentPage("collection")}>
          My Collection
        </button>
        {isGuest ? (
          <button onClick={() => handleSignOut()}>Sign out</button>
        ) : (
          ""
        )}
      </div>

      {/* Main Content Area */}
      <div className="page-content">{renderPage()}</div>
    </div>
  );
}

export default App;
