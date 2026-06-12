import React from 'react';

interface ExerciseFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  muscleFilter: string;
  onMuscleFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
}

const muscleGroups = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs'
];

export const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
  search,
  onSearchChange,
  muscleFilter,
  onMuscleFilterChange,
  typeFilter,
  onTypeFilterChange,
  sourceFilter,
  onSourceFilterChange
}) => {
  return (
    <>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filters">
        <select
          className="filter-btn"
          value={muscleFilter}
          onChange={(e) => onMuscleFilterChange(e.target.value)}
        >
          {muscleGroups.map(m => (
            <option key={m} value={m === 'All' ? '' : m}>{m}</option>
          ))}
        </select>

        <button
          className={`filter-btn ${typeFilter === '' ? 'active' : ''}`}
          onClick={() => onTypeFilterChange('')}
        >All Types</button>
        <button
          className={`filter-btn ${typeFilter === 'BILATERAL' ? 'active' : ''}`}
          onClick={() => onTypeFilterChange('BILATERAL')}
        >Bilateral</button>
        <button
          className={`filter-btn ${typeFilter === 'UNILATERAL' ? 'active' : ''}`}
          onClick={() => onTypeFilterChange('UNILATERAL')}
        >Unilateral</button>

        <button
          className={`filter-btn ${sourceFilter === '' ? 'active' : ''}`}
          onClick={() => onSourceFilterChange('')}
        >All</button>
        <button
          className={`filter-btn ${sourceFilter === 'library' ? 'active' : ''}`}
          onClick={() => onSourceFilterChange('library')}
        >Library</button>
        <button
          className={`filter-btn ${sourceFilter === 'custom' ? 'active' : ''}`}
          onClick={() => onSourceFilterChange('custom')}
        >My Exercises</button>
      </div>
    </>
  );
};