// src/components/exercises/SubmissionsTable.tsx
'use client';

import React, { useState } from 'react';
import { Submission, Exercise } from '@/types/exercise';
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Download, 
  Mail, 
  User,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';

interface SubmissionsTableProps {
  submissions: Submission[];
  exercise: Exercise;
  onGradeSubmission: (submission: Submission) => void;
  filter: {
    graded: 'all' | 'graded' | 'ungraded';
    search: string;
    sortBy: 'submittedAt' | 'studentName' | 'score';
    sortOrder: 'asc' | 'desc';
  };
}

export default function SubmissionsTable({
  submissions,
  exercise,
  onGradeSubmission,
  filter
}: SubmissionsTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Filtrer et trier les soumissions
  const filteredAndSortedSubmissions = React.useMemo(() => {
    let result = [...submissions];

    // Filtre par état
    if (filter.graded === 'graded') {
      result = result.filter(s => s.graded);
    } else if (filter.graded === 'ungraded') {
      result = result.filter(s => !s.graded);
    }

    // Filtre par recherche
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(s =>
        s.studentName.toLowerCase().includes(searchLower) ||
        s.studentEmail?.toLowerCase().includes(searchLower) ||
        s.studentId.toLowerCase().includes(searchLower)
      );
    }

    // Tri
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filter.sortBy) {
        case 'studentName':
          aValue = a.studentName;
          bValue = b.studentName;
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'submittedAt':
        default:
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
      }

      if (filter.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [submissions, filter]);

  const handleRowSelect = (submissionId: number) => {
    setSelectedRows(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredAndSortedSubmissions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredAndSortedSubmissions.map(s => s.id));
    }
  };

  const getScoreColor = (score: number | undefined, maxScore: number) => {
    if (score === undefined) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadSubmission = (submission: Submission) => {
    // Logique de téléchargement
    const data = {
      student: submission.studentName,
      exercise: exercise.title,
      score: submission.score,
      maxScore: exercise.maxScore,
      submittedAt: submission.submittedAt,
      answers: submission.answers
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soumission-${submission.studentName}-${exercise.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-x-auto">
      {/* En-tête avec statistiques */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedSubmissions.length} soumission{filteredAndSortedSubmissions.length !== 1 ? 's' : ''} trouvée{filteredAndSortedSubmissions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedSubmissions.filter(s => s.graded).length} notée{filteredAndSortedSubmissions.filter(s => s.graded).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedSubmissions.filter(s => !s.graded).length} à corriger
              </span>
            </div>
          </div>
          
          {selectedRows.length > 0 && (
            <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedRows.length} sélectionné{selectedRows.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedRows.length === filteredAndSortedSubmissions.length && filteredAndSortedSubmissions.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Étudiant
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Soumis le
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {filteredAndSortedSubmissions.map((submission) => (
            <tr 
              key={submission.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                selectedRows.includes(submission.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(submission.id)}
                  onChange={() => handleRowSelect(submission.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {submission.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {submission.studentName}
                    </div>
                    {submission.studentEmail && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {submission.studentEmail}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  submission.graded
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {submission.graded ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Noté
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      À corriger
                    </>
                  )}
                </span>
                {submission.gradedAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Corrigé le {formatDate(submission.gradedAt)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${getScoreColor(submission.score, submission.maxScore)}`}>
                    {submission.score !== undefined ? submission.score : '--'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mx-1">/</span>
                  <span className="text-gray-700 dark:text-gray-300">{submission.maxScore}</span>
                  {submission.score !== undefined && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({Math.round((submission.score / submission.maxScore) * 100)}%)
                    </span>
                  )}
                </div>
                {submission.feedback && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs mt-1" title={submission.feedback}>
                    {submission.feedback.substring(0, 50)}...
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div>{formatDate(submission.submittedAt)}</div>
                {submission.timeSpent && (
                  <div className="text-xs mt-1">
                    Temps: {Math.round(submission.timeSpent / 60)} min
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGradeSubmission(submission)}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      submission.graded
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {submission.graded ? 'Re-corriger' : 'Corriger'}
                  </button>
                  <button
                    onClick={() => downloadSubmission(submission)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pied de tableau */}
      {filteredAndSortedSubmissions.length === 0 && (
        <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Eye className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Aucune soumission ne correspond aux filtres
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}

      {/* Actions groupées */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {selectedRows.length} soumission{selectedRows.length !== 1 ? 's' : ''} sélectionnée{selectedRows.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Action groupée 1
                    console.log('Action groupée sur:', selectedRows);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Noter en masse
                </button>
                <button
                  onClick={() => {
                    // Action groupée 2
                    console.log('Télécharger:', selectedRows);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Exporter
                </button>
                <button
                  onClick={() => setSelectedRows([])}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}