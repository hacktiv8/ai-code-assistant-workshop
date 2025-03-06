import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useLocalIdeasStorage } from './useLocalIdeasStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {} as Record<string, string>;

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

// Replace the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useLocalIdeasStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  test('should initialize with empty ideas array when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);

    const { result } = renderHook(() => useLocalIdeasStorage());

    expect(result.current.ideas).toEqual([]);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ideas');
  });

  test('should load ideas from localStorage on initialization', () => {
    const mockIdeas = [
      { id: '1', text: 'Test idea 1', timestamp: 1625097600000 },
      { id: '2', text: 'Test idea 2', timestamp: 1625184000000 }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockIdeas));

    const { result } = renderHook(() => useLocalIdeasStorage());

    expect(result.current.ideas).toEqual(mockIdeas);
  });

  test('should add a new idea', () => {
    // Mock the randomUUID function
    const mockUUID = '123-456-789';
    const originalRandomUUID = crypto.randomUUID;
    crypto.randomUUID = vi.fn().mockReturnValue(mockUUID);

    // Mock Date.now
    const mockTimestamp = 1625097600000;
    const originalDateNow = Date.now;
    Date.now = vi.fn().mockReturnValue(mockTimestamp);

    const { result } = renderHook(() => useLocalIdeasStorage());

    act(() => {
      result.current.addIdea('New test idea');
    });

    expect(result.current.ideas).toEqual([
      { id: mockUUID, text: 'New test idea', timestamp: mockTimestamp }
    ]);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ideas',
      JSON.stringify([{ id: mockUUID, text: 'New test idea', timestamp: mockTimestamp }])
    );

    // Restore the original functions
    crypto.randomUUID = originalRandomUUID;
    Date.now = originalDateNow;
  });

  test('should update an existing idea', () => {
    const mockIdeas = [
      { id: '1', text: 'Test idea 1', timestamp: 1625097600000 },
      { id: '2', text: 'Test idea 2', timestamp: 1625184000000 }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockIdeas));

    const { result } = renderHook(() => useLocalIdeasStorage());

    act(() => {
      result.current.updateIdea('2', 'Updated test idea');
    });

    expect(result.current.ideas).toEqual([
      { id: '1', text: 'Test idea 1', timestamp: 1625097600000 },
      { id: '2', text: 'Updated test idea', timestamp: 1625184000000 }
    ]);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should delete an existing idea', () => {
    const mockIdeas = [
      { id: '1', text: 'Test idea 1', timestamp: 1625097600000 },
      { id: '2', text: 'Test idea 2', timestamp: 1625184000000 }
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockIdeas));

    const { result } = renderHook(() => useLocalIdeasStorage());

    act(() => {
      result.current.deleteIdea('1');
    });

    expect(result.current.ideas).toEqual([
      { id: '2', text: 'Test idea 2', timestamp: 1625184000000 }
    ]);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should handle localStorage errors gracefully when loading', () => {
    // Mock console.error to avoid test output pollution
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => { });

    // Simulate an error when getting from localStorage
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useLocalIdeasStorage());

    expect(result.current.ideas).toEqual([]);
    expect(consoleErrorMock).toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });

  test('should handle localStorage errors gracefully when saving', () => {
    // Mock console.error to avoid test output pollution
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => { });

    // Set up the hook with an initial state
    const { result } = renderHook(() => useLocalIdeasStorage());

    // Simulate an error when setting to localStorage
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('localStorage error');
    });

    act(() => {
      result.current.addIdea('Test idea');
    });

    expect(consoleErrorMock).toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });
});
