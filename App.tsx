
import React, { useState, useEffect } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { ChatTooltip } from './components/ChatTooltip';
import { AddCategoryModal } from './components/AddCategoryModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { InfoModal } from './components/InfoModal';
import { InfoIcon } from './components/icons/InfoIcon';
import { discoverPlaces, reverseGeocode, createPlaceCategory } from './services/geminiService';
import type { PlaceType, UserLocation, DiscoveredPlace, NodeItem } from './types';

const INITIAL_PLACE_TYPES: PlaceType[] = [
  { id: 'hotels', name: 'Hotels', emoji: '🏨', description: 'Find and ask about local hotels and lodging.', promptContext: 'Hello! I am your hotel assistant. How can I help you find information about hotels near you today?' },
  { id: 'clubs', name: 'Clubs & Bars', emoji: '💃', description: 'Explore nightlife, clubs, and bars in the area.', promptContext: 'Hey there! Ready to explore the nightlife? I can help with information about clubs and bars nearby. What are you looking for?' },
  { id: 'hospitals', name: 'Hospitals', emoji: '🏥', description: 'Get info on nearby hospitals and medical centers.', promptContext: 'Hello. I can provide information on nearby hospitals and healthcare facilities. How can I assist you?' },
  { id: 'restaurants', name: 'Restaurants', emoji: '🍔', description: 'Discover dining options and restaurant details.', promptContext: 'Hungry? I can help you find restaurants and answer your questions about them. What kind of food are you in the mood for?' },
  { id: 'parks', name: 'Parks', emoji: '🌳', description: 'Find parks, trails, and recreational areas.', promptContext: "Hi! I'm your guide to local parks and nature spots. Ask me about park hours, amenities, or directions." },
  { id: 'museums', name: 'Museums', emoji: '🏛️', description: 'Learn about museums and cultural attractions.', promptContext: 'Welcome! I can provide details on museums and cultural attractions. Which one interests you?' },
];

const ADD_CATEGORY_NODE: PlaceType = {
  id: 'add-new-category',
  name: 'Add New',
  emoji: '➕',
  description: 'Add a new category of places to explore.',
  promptContext: '', // Not used
};


const LoadingIndicator: React.FC<{text: string}> = ({text}) => (
  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-slate-300">{text}</p>
  </div>
);

function App() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationName, setLocationName] = useState<string>('Your Location');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>(INITIAL_PLACE_TYPES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [graphView, setGraphView] = useState<'categories' | 'places'>('categories');
  const [currentCategory, setCurrentCategory] = useState<PlaceType | null>(null);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<DiscoveredPlace[]>([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  
  const [activeChatPlace, setActiveChatPlace] = useState<{place: DiscoveredPlace, position: {x: number, y: number}} | null>(null);
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
        setLocationName(name);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Geolocation is not available. Some features may be limited.");
      }
    );
  }, []);

  const handleAddCategory = async (categoryName: string) => {
    const id = categoryName.toLowerCase().replace(/\s+/g, '-');
    if (placeTypes.some(p => p.id === id)) {
        throw new Error("A category with this name already exists.");
    }
    
    const newCategoryDetails = await createPlaceCategory(categoryName);
    
    const newPlaceType: PlaceType = {
        id,
        name: categoryName,
        ...newCategoryDetails,
    };
    
    setPlaceTypes(prev => [...prev, newPlaceType]);
    setIsAddModalOpen(false);
  };

  const handleCategoryClick = async (category: PlaceType) => {
    if (!userLocation) {
        setLocationError("We need your location to find places near you. Please enable location services.");
        return;
    }
    setCurrentCategory(category);
    setIsFetchingPlaces(true);
    setActiveChatPlace(null);
    const places = await discoverPlaces(category, userLocation);
    setDiscoveredPlaces(places);
    setGraphView('places');
    setIsFetchingPlaces(false);
  };

  const handlePlaceClick = (place: DiscoveredPlace, position: {x: number, y: number}) => {
    setActiveChatPlace({ place, position });
  };
  
  const handleNodeClick = (node: NodeItem, position?: {x: number, y: number}) => {
    if (node.id === 'add-new-category') {
      setIsAddModalOpen(true);
      return;
    }

    if ('promptContext' in node) { // It's a PlaceType
      handleCategoryClick(node);
    } else { // It's a DiscoveredPlace
      if (position) {
          handlePlaceClick(node, position);
      }
    }
  };
  
  const handleBackToCategories = () => {
    setGraphView('categories');
    setCurrentCategory(null);
    setDiscoveredPlaces([]);
    setActiveChatPlace(null);
  };

  const handleCloseChat = () => {
    setActiveChatPlace(null);
  };

  const handleNodeRemove = (node: NodeItem) => {
    // We only allow removing categories (PlaceType)
    if ('promptContext' in node) {
      setNodeToRemove(node);
    }
  };

  const handleConfirmRemove = () => {
    if (nodeToRemove) {
      setPlaceTypes(prev => prev.filter(p => p.id !== nodeToRemove.id));
      setNodeToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setNodeToRemove(null);
  };

  const nodes = graphView === 'categories' ? [...placeTypes, ADD_CATEGORY_NODE] : discoveredPlaces;
  
  const centerLabel = graphView === 'categories'
    ? (
        <>
          <div className="text-4xl animate-pulse">📍</div>
          <div className="text-sm font-bold max-w-[120px] truncate" title={locationName}>
            {locationName}
          </div>
        </>
      )
    : currentCategory?.name ?? 'Places';

  const onNodeRemoveHandler = graphView === 'categories' ? handleNodeRemove : undefined;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden relative">
      <button
        onClick={() => setIsInfoModalOpen(true)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 text-slate-400 hover:text-cyan-400 transition-colors"
        aria-label="About this project"
      >
        <InfoIcon className="w-7 h-7" />
      </button>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <header className="text-center mb-4 z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    ClickSurf
                </span>
            </h1>
          <p className="mt-4 text-lg text-slate-400">
            {graphView === 'categories' 
                ? 'Surf, ask and explore about your city in just clicks.'
                : `Exploring ${currentCategory?.name}. Click a node to chat.`
            }
          </p>
          {locationError && <p className="mt-2 text-sm bg-yellow-900/50 text-yellow-300 border border-yellow-700 p-2 rounded-md">{locationError}</p>}
        </header>
        
        <main className="flex justify-center items-center my-4 relative w-full max-w-[600px] aspect-square">
           {isFetchingPlaces && <LoadingIndicator text={`Finding ${currentCategory?.name}...`}/>}
          <KnowledgeGraph 
            key={graphView} // Re-mount component on view change for animation
            nodes={nodes} 
            centerNodeLabel={centerLabel}
            onNodeClick={handleNodeClick} 
            onNodeRemove={onNodeRemoveHandler}
            onBackClick={graphView === 'places' ? handleBackToCategories : undefined}
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
        categoryName={nodeToRemove?.name ?? ''}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}

export default App;
