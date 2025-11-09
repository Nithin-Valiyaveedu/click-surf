import React, { useState, useEffect } from "react";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import { ChatTooltip } from "./components/ChatTooltip";
import { AddCategoryModal } from "./components/AddCategoryModal";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { InfoModal } from "./components/InfoModal";
import { InfoIcon } from "./components/icons/InfoIcon";
import {
  discoverPlaces,
  reverseGeocode,
  createPlaceCategory,
} from "./services/geminiService";
import type {
  PlaceType,
  UserLocation,
  DiscoveredPlace,
  NodeItem,
} from "./types";

const INITIAL_PLACE_TYPES: PlaceType[] = [
  {
    id: "hotels",
    name: "Hotels",
    emoji: "🏨",
    description: "Find and ask about local hotels and lodging.",
    promptContext:
      "Hello! I am your hotel assistant. How can I help you find information about hotels near you today?",
  },
  {
    id: "clubs",
    name: "Clubs & Bars",
    emoji: "💃",
    description: "Explore nightlife, clubs, and bars in the area.",
    promptContext:
      "Hey there! Ready to explore the nightlife? I can help with information about clubs and bars nearby. What are you looking for?",
  },
  {
    id: "hospitals",
    name: "Hospitals",
    emoji: "🏥",
    description: "Get info on nearby hospitals and medical centers.",
    promptContext:
      "Hello. I can provide information on nearby hospitals and healthcare facilities. How can I assist you?",
  },
  {
    id: "restaurants",
    name: "Restaurants",
    emoji: "🍔",
    description: "Discover dining options and restaurant details.",
    promptContext:
      "Hungry? I can help you find restaurants and answer your questions about them. What kind of food are you in the mood for?",
  },
  {
    id: "parks",
    name: "Parks",
    emoji: "🌳",
    description: "Find parks, trails, and recreational areas.",
    promptContext:
      "Hi! I'm your guide to local parks and nature spots. Ask me about park hours, amenities, or directions.",
  },
  {
    id: "museums",
    name: "Museums",
    emoji: "🏛️",
    description: "Learn about museums and cultural attractions.",
    promptContext:
      "Welcome! I can provide details on museums and cultural attractions. Which one interests you?",
  },
];

const ADD_CATEGORY_NODE: PlaceType = {
  id: "add-new-category",
  name: "Add New",
  emoji: "➕",
  description: "Add a new category of places to explore.",
  promptContext: "", // Not used
};

const LoadingIndicator: React.FC<{ text: string }> = ({ text }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex flex-col items-center justify-center z-50 animate-fade-in">
    <div className="relative mb-8">
      {/* Outer rotating ring */}
      <div className="w-24 h-24 border-4 border-cyan-500/20 rounded-full"></div>

      {/* Main spinning ring with gradient */}
      <div
        className="w-24 h-24 border-4 border-transparent border-t-cyan-400 border-r-cyan-500 rounded-full animate-spin absolute top-0 left-0"
        style={{ animationDuration: "1s" }}
      ></div>

      {/* Secondary spinning ring (opposite direction) */}
      <div
        className="w-20 h-20 border-4 border-transparent border-b-blue-400 border-l-blue-500 rounded-full absolute top-2 left-2"
        style={{ animation: "spin 1.5s linear infinite reverse" }}
      ></div>

      {/* Inner pulsing dot */}
      <div className="w-3 h-3 bg-cyan-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

      {/* Glow effects */}
      <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
      <div
        className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>

      {/* Orbiting particles */}
      <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 animate-ping"></div>
      <div
        className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 animate-ping"
        style={{ animationDelay: "0.3s" }}
      ></div>
    </div>

    {/* Loading text with animation */}
    <div className="text-center">
      <p className="text-slate-100 text-xl font-semibold mb-2 animate-pulse">
        {text}
      </p>
      <div className="flex gap-1.5 justify-center">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  </div>
);

function App() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationName, setLocationName] = useState<string>("Your Location");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [placeTypes, setPlaceTypes] =
    useState<PlaceType[]>(INITIAL_PLACE_TYPES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [graphView, setGraphView] = useState<"categories" | "places">(
    "categories"
  );
  const [currentCategory, setCurrentCategory] = useState<PlaceType | null>(
    null
  );
  const [discoveredPlaces, setDiscoveredPlaces] = useState<DiscoveredPlace[]>(
    []
  );
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);

  const [activeChatPlace, setActiveChatPlace] = useState<{
    place: DiscoveredPlace;
    position: { x: number; y: number };
  } | null>(null);
  const [nodeToRemove, setNodeToRemove] = useState<PlaceType | null>(null); // New state for confirmation

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setLocationError(null);
        const name = await reverseGeocode(newLocation);
        setLocationName(name.split(",")[0]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          "Geolocation is not available. Some features may be limited."
        );
      }
    );
  }, []);

  const handleAddCategory = async (categoryName: string) => {
    const id = categoryName.toLowerCase().replace(/\s+/g, "-");
    if (placeTypes.some((p) => p.id === id)) {
      throw new Error("A category with this name already exists.");
    }

    const newCategoryDetails = await createPlaceCategory(categoryName);

    const newPlaceType: PlaceType = {
      id,
      name: categoryName,
      ...newCategoryDetails,
    };

    setPlaceTypes((prev) => [...prev, newPlaceType]);
    setIsAddModalOpen(false);
  };

  const handleCategoryClick = async (category: PlaceType) => {
    if (!userLocation) {
      setLocationError(
        "We need your location to find places near you. Please enable location services."
      );
      return;
    }
    setCurrentCategory(category);
    setIsFetchingPlaces(true);
    setActiveChatPlace(null);
    const places = await discoverPlaces(category, userLocation);
    setDiscoveredPlaces(places);
    setGraphView("places");
    setIsFetchingPlaces(false);
  };

  const handlePlaceClick = (
    place: DiscoveredPlace,
    position: { x: number; y: number }
  ) => {
    setActiveChatPlace({ place, position });
  };

  const handleNodeClick = (
    node: NodeItem,
    position?: { x: number; y: number }
  ) => {
    if (node.id === "add-new-category") {
      setIsAddModalOpen(true);
      return;
    }

    if ("promptContext" in node) {
      // It's a PlaceType
      handleCategoryClick(node);
    } else {
      // It's a DiscoveredPlace
      if (position) {
        handlePlaceClick(node, position);
      }
    }
  };

  const handleBackToCategories = () => {
    setGraphView("categories");
    setCurrentCategory(null);
    setDiscoveredPlaces([]);
    setActiveChatPlace(null);
  };

  const handleCloseChat = () => {
    setActiveChatPlace(null);
  };

  const handleNodeRemove = (node: NodeItem) => {
    // We only allow removing categories (PlaceType)
    if ("promptContext" in node) {
      setNodeToRemove(node);
    }
  };

  const handleConfirmRemove = () => {
    if (nodeToRemove) {
      setPlaceTypes((prev) => prev.filter((p) => p.id !== nodeToRemove.id));
      setNodeToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setNodeToRemove(null);
  };

  const nodes =
    graphView === "categories"
      ? [...placeTypes, ADD_CATEGORY_NODE]
      : discoveredPlaces;

  const centerLabel =
    graphView === "categories" ? (
      <>
        <div className="text-5xl animate-pulse mb-2">📍</div>
        <div
          className="text-base font-bold max-w-[140px] truncate text-cyan-100"
          title={locationName}
        >
          {locationName}
        </div>
      </>
    ) : (
      <div className="text-center px-4">
        <div className="text-3xl mb-2">{currentCategory?.emoji}</div>
        <div className="text-base font-bold text-cyan-100">
          {currentCategory?.name ?? "Places"}
        </div>
      </div>
    );

  const onNodeRemoveHandler =
    graphView === "categories" ? handleNodeRemove : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>

      <button
        onClick={() => setIsInfoModalOpen(true)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 transition-all duration-300 rounded-full p-2 hover:scale-110"
        aria-label="About this project"
      >
        <InfoIcon className="w-6 h-6" />
      </button>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center relative z-10">
        <header className="text-center mb-8 z-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-2">
            <span className="text-white">ClickSurf</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
            {graphView === "categories"
              ? "Surf, ask and explore your city in just clicks."
              : `Exploring ${currentCategory?.name}. Click a node to chat.`}
          </p>
          {locationError && (
            <div className="mt-4 inline-block">
              <p className="text-sm bg-yellow-900/30 backdrop-blur-sm text-yellow-300 border border-yellow-700/50 px-4 py-2.5 rounded-lg shadow-lg">
                {locationError}
              </p>
            </div>
          )}
        </header>

        <main className="flex justify-center items-center my-4 relative w-full max-w-[650px] aspect-square">
          {isFetchingPlaces && (
            <LoadingIndicator text={`Finding ${currentCategory?.name}...`} />
          )}
          <KnowledgeGraph
            key={graphView} // Re-mount component on view change for animation
            nodes={nodes}
            centerNodeLabel={centerLabel}
            onNodeClick={handleNodeClick}
            onNodeRemove={onNodeRemoveHandler}
            onBackClick={
              graphView === "places" ? handleBackToCategories : undefined
            }
          />
        </main>
      </div>

      {activeChatPlace && (
        <ChatTooltip
          place={activeChatPlace.place}
          position={activeChatPlace.position}
          userLocation={userLocation}
          onClose={handleCloseChat}
        />
      )}

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />

      <ConfirmDeleteModal
        isOpen={!!nodeToRemove}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        categoryName={nodeToRemove?.name ?? ""}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}

export default App;
