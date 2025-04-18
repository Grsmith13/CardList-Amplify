import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { SearchPage } from "./SearchPage";
import { CollectionPage } from "./CollectionPage";
import "./App.css";
import { fetchAndStore, getData } from "./components/CreateCache";
import { deleteAllCardsFromBinder } from "./components/DeleteAllCards";

interface AppProps {
  isGuest: boolean;
}

function App({ isGuest }: AppProps) {
  console.log("isGuest =", isGuest);
  useEffect(() => {
    fetchAndStore();
  }, []);
  console.log(getData("Dark Magician"));
  const { signOut, user } = useAuthenticator();
  const [currentPage, setCurrentPage] = useState<string>("collection");

  const renderPage = () => {
    if (currentPage === "search") {
      return <SearchPage />;
    }

    return <CollectionPage />;
  };

  const handleSignOut = async () => {
    await deleteAllCardsFromBinder(); // <-- delete cards before sign out

    await signOut(); // clear the Cognito session
    window.location.reload(); // restart your app at main.tsx
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <div className="auth-header-bar">
        {user && (
          <button onClick={signOut} className="sign-out-btn">
            Sign out
          </button>
        )}
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
