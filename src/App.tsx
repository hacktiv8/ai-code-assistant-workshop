import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useLocalIdeasStorage } from './hooks/useLocalIdeasStorage';
import './App.css';

// Update the Idea interface to match the one in useLocalIdeasStorage
interface Idea {
  id: string;
  text: string;
  timestamp: number;  // Changed from createdAt: Date
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { ideas, updateIdea, deleteIdea, addIdea } = useLocalIdeasStorage();
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Filter ideas based on search query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredIdeas(ideas);
      return;
    }

    const lowerCaseQuery = searchTerm.toLowerCase();
    const filtered = ideas.filter(idea =>
      idea.text.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredIdeas(filtered);
  }, [searchTerm, ideas]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // If no results and we have a query, offer to create a new idea
    if (filteredIdeas.length === 0 && searchTerm.trim()) {
      if (window.confirm(`No ideas found for "${searchTerm}". Create a new idea with this text?`)) {
        addIdea(searchTerm);
      }
    }
  };

  const startEditing = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.text);
  };

  const saveEdit = () => {
    if (!editingId) return;

    updateIdea(editingId, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteIdea = (id: string) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      deleteIdea(id);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-black border-b-4 border-black pb-2 inline-block">
            IDEA VAULT
          </h1>
          <p className="mt-2 text-gray-700">Store and search your text-based ideas</p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex border-2 border-black">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ideas or create new..."
              className="flex-grow p-3 text-lg bg-white outline-none"
            />
            <button
              type="submit"
              className="bg-black text-white p-3 flex items-center hover:bg-gray-800 transition-colors"
            >
              <Search size={20} className="mr-2" />
              Search
            </button>
          </div>
        </form>

        {/* Create New Idea Button */}
        {searchTerm.trim() && (
          <button
            onClick={() => addIdea(searchTerm)}
            className="mb-6 bg-white border-2 border-black p-3 flex items-center hover:bg-gray-100 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Create New Idea with This Text
          </button>
        )}

        {/* Ideas List */}
        <div className="space-y-4">
          {filteredIdeas.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-gray-300 text-center text-gray-500">
              {searchTerm.trim()
                ? "No ideas found matching your search"
                : "No ideas yet. Start by creating one!"}
            </div>
          ) : (
            filteredIdeas.map(idea => (
              <div
                key={idea.id}
                className="p-4 border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              >
                {editingId === idea.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border-2 border-black mb-2"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 border-2 border-black hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-black text-white border-2 border-black hover:bg-gray-800"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 whitespace-pre-wrap">{idea.text}</p>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        {new Date(idea.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(idea)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label="Edit idea"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-500"
                          aria-label="Delete idea"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;