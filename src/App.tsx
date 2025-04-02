import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { SearchPage } from "./SearchPage";
import { CollectionPage } from "./CollectionPage";
import "./App.css";
import { fetchAndStore, getData } from "./components/CreateCache";

function App() {
  useEffect(() => {
    fetchAndStore();
  }, []);
  console.log(getData("Dark Magician"));
  const { signOut, user } = useAuthenticator();
  const [currentPage, setCurrentPage] = useState<string>("collection");

  const renderPage = () => {
    if (!user) {
      return (
        <div className="auth-message">
          <p>Please sign in to access your collection and search for cards.</p>
        </div>
      );
    }

    if (currentPage === "search") {
      return <SearchPage />;
    }

    return <CollectionPage />;
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
      </div>

      {/* Main Content Area */}
      <div className="page-content">{renderPage()}</div>
    </div>
  );
}

export default App;
