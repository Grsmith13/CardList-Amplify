import { useState } from "react";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { SearchPage } from "./SearchPage";
import { CollectionPage } from "./CollectionPage";
import "./App.css";

function App() {
  const { signOut, user } = useAuthenticator();
  const [currentPage, setCurrentPage] = useState<string>("collection");

  // Render different pages based on user authentication status
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
      {/* Header Bar with Page Buttons and Sign Out */}
      <div className="auth-header">
        {user && (
          <button onClick={signOut} className="sign-out-btn">
            Sign out
          </button>
        )}
      </div>

      {/* Page Buttons Bar */}
      <div className="page-buttons">
        <button
          onClick={() => setCurrentPage("search")}
          className="page-button"
        >
          Search Cards
        </button>
        <button
          onClick={() => setCurrentPage("collection")}
          className="page-button"
        >
          My Collection
        </button>
      </div>

      {/* Main Content Area */}
      <div className="page-content">{renderPage()}</div>
    </div>
  );
}

export default App;
