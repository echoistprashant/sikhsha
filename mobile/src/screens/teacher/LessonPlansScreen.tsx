import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../api/httpClient';
import { logger } from '../../utils/logger';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';

interface TopicPlan {
  name: string;
  objectives: string[];
  teachingMinutes: number;
  periods: number;
  keyPoints: string[];
}

interface ChapterPlan {
  name: string;
  topics: TopicPlan[];
  totalMinutes: number;
  totalPeriods: number;
}

interface CurriculumPlan {
  title: string;
  subject: string;
  gradeLevel: string;
  totalHours: number;
  totalPeriods: number;
  chapters: ChapterPlan[];
}

interface Chapter {
  name: string;
  topics?: { name: string }[];
}

const CLASS_OPTIONS = ['8', '9', '10', '11', '12'];

const LessonPlansScreen: React.FC = () => {
  const { token } = useAuth();

  // Selection state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // API data
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Loading states
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // UI state
  const [generatedPlan, setGeneratedPlan] = useState<CurriculumPlan | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Picker modals
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);

  // Load subjects when class changes
  useEffect(() => {
    if (selectedClass && token) {
      setLoadingSubjects(true);
      setSelectedSubject('');
      setSelectedChapter('');
      setChapters([]);

      request<string[]>(`/curriculum/${selectedClass}/subjects`, { token })
        .then(data => {
          setSubjects(data || []);
        })
        .catch(err => {
          logger.error('Failed to fetch subjects', { error: err.message });
          setSubjects([]);
        })
        .finally(() => setLoadingSubjects(false));
    }
  }, [selectedClass, token]);

  // Load chapters when subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject && token) {
      setLoadingChapters(true);
      setSelectedChapter('');

      request<Chapter[]>(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/chapters`, { token })
        .then(data => {
          setChapters(data || []);
        })
        .catch(err => {
          logger.error('Failed to fetch chapters', { error: err.message });
          setChapters([]);
        })
        .finally(() => setLoadingChapters(false));
    }
  }, [selectedClass, selectedSubject, token]);

  const toggleChapter = (chapterName: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterName)) {
        next.delete(chapterName);
      } else {
        next.add(chapterName);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (generatedPlan) {
      setExpandedChapters(new Set(generatedPlan.chapters.map(c => c.name)));
    }
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
  };

  const canGenerate = selectedClass && selectedSubject && selectedChapter;

  const handleGenerate = async () => {
    if (!token || !canGenerate) {
      Toast.show({
        type: 'error',
        text1: 'Missing Selection',
        text2: 'Please select class, subject, and chapter',
      });
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedPlan(null);

    try {
      // Match frontend payload exactly
      const payload = {
        gradeLevel: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
      };

      logger.info('Generating curriculum plan', payload);

      const plan = await request<CurriculumPlan>('/teacher/curriculum-plan/generate', {
        method: 'POST',
        token,
        body: payload,
      });

      setGeneratedPlan(plan);

      // Expand all chapters by default
      if (plan.chapters?.length > 0) {
        setExpandedChapters(new Set(plan.chapters.map(c => c.name)));
      }

      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `Generated lesson plan for ${selectedChapter}`,
        visibilityTime: 3000,
      });

      logger.info('Curriculum plan generated successfully', { title: plan.title });
    } catch (err: any) {
      logger.error('Curriculum plan generation failed', { error: err.message });
      setError(err.message || 'Failed to generate curriculum plan');
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: err.message || 'Please try again',
        visibilityTime: 5000,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSharePDF = async () => {
    if (!generatedPlan) {
      Toast.show({
        type: 'error',
        text1: 'No Plan',
        text2: 'Generate a lesson plan first before saving to PDF',
      });
      return;
    }

    setGeneratingPDF(true);

    try {
      // Create text content for the curriculum plan
      let content = `${generatedPlan.title}\n`;
      content += `${'='.repeat(60)}\n\n`;
      content += `Subject: ${generatedPlan.subject}\n`;
      content += `Grade Level: ${generatedPlan.gradeLevel}\n`;
      content += `Total Hours: ${generatedPlan.totalHours}\n`;
      content += `Total Periods: ${generatedPlan.totalPeriods}\n\n`;
      content += `${'='.repeat(60)}\n\n`;

      generatedPlan.chapters?.forEach((chapter, chapterIndex) => {
        content += `CHAPTER ${chapterIndex + 1}: ${chapter.name}\n`;
        content += `Duration: ${chapter.totalPeriods} periods (${Math.round(chapter.totalMinutes / 60)} hours)\n`;
        content += `${'-'.repeat(50)}\n\n`;

        chapter.topics?.forEach((topic, topicIndex) => {
          content += `  TOPIC ${topicIndex + 1}: ${topic.name}\n`;
          content += `  Periods: ${topic.periods} | Minutes: ${topic.teachingMinutes}\n\n`;

          content += `  Objectives:\n`;
          topic.objectives?.forEach((obj) => {
            content += `    • ${obj}\n`;
          });

          content += `\n  Key Points:\n`;
          topic.keyPoints?.forEach((point) => {
            content += `    • ${point}\n`;
          });
          content += '\n';
        });
        content += '\n';
      });

      // Save as text file
      const timestamp = Date.now();
      const fileName = `lesson_plan_${selectedSubject}_${timestamp}.txt`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, content, 'utf8');

      logger.info('Lesson plan file saved successfully', { filePath });

      Toast.show({
        type: 'success',
        text1: 'Lesson Plan Saved!',
        text2: `Saved to: ${fileName}`,
        visibilityTime: 4000,
      });
    } catch (err: any) {
      logger.error('Lesson plan save failed', { error: err.message });
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: err.message || 'Could not save lesson plan',
        visibilityTime: 5000,
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: { value: string; label: string }[],
    onSelect: (value: string) => void,
    selectedValue: string,
    loading?: boolean
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#6366f1" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    selectedValue === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}>
                  <Text style={[
                    styles.optionText,
                    selectedValue === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!token) {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Sign in required</Text>
          <Text style={styles.subtitle}>
            Please log in as a teacher or admin to manage lesson plans.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Curriculum Lesson Planner</Text>
        <Text style={styles.headerSubtitle}>
          Generate a complete curriculum plan with objectives and time estimates
        </Text>

        <GlassCard style={styles.formCard}>
          {/* Class Selection */}
          <Text style={styles.label}>Class <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowClassPicker(true)}
            disabled={generating}>
            <Text style={styles.dropdownText}>
              {selectedClass ? `Class ${selectedClass}` : 'Select class...'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Subject Selection */}
          <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdown, !selectedClass && styles.dropdownDisabled]}
            onPress={() => selectedClass && setShowSubjectPicker(true)}
            disabled={!selectedClass || generating || loadingSubjects}>
            <Text style={[styles.dropdownText, !selectedClass && styles.dropdownTextDisabled]}>
              {loadingSubjects ? 'Loading...' : selectedSubject || 'Select subject...'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Chapter Selection */}
          <Text style={styles.label}>Chapter <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdown, !selectedSubject && styles.dropdownDisabled]}
            onPress={() => selectedSubject && setShowChapterPicker(true)}
            disabled={!selectedSubject || generating || loadingChapters}>
            <Text style={[styles.dropdownText, !selectedSubject && styles.dropdownTextDisabled]}>
              {loadingChapters ? 'Loading...' : selectedChapter || 'Select chapter...'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, !canGenerate && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={generating || !canGenerate}>
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>✨ Generate Curriculum Plan</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What you'll get:</Text>
            <Text style={styles.infoItem}>• All topics in the chapter</Text>
            <Text style={styles.infoItem}>• Learning objectives per topic</Text>
            <Text style={styles.infoItem}>• Estimated teaching time</Text>
            <Text style={styles.infoItem}>• Key teaching points</Text>
          </View>
        </GlassCard>

        {/* Results Display */}
        {generatedPlan && (
          <GlassCard style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>{generatedPlan.title}</Text>
                <Text style={styles.resultSubtitle}>
                  ✓ {generatedPlan.chapters.length} chapters • {generatedPlan.totalHours} hours • {generatedPlan.totalPeriods} periods
                </Text>
              </View>
            </View>

            <View style={styles.expandButtons}>
              <TouchableOpacity style={styles.expandBtn} onPress={expandAll}>
                <Text style={styles.expandBtnText}>Expand All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.expandBtn} onPress={collapseAll}>
                <Text style={styles.expandBtnText}>Collapse All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chaptersContainer}>
              {generatedPlan.chapters.map((chapter, chapterIndex) => (
                <View key={chapter.name} style={styles.chapterItem}>
                  <TouchableOpacity
                    style={styles.chapterHeader}
                    onPress={() => toggleChapter(chapter.name)}>
                    <Text style={styles.expandIcon}>
                      {expandedChapters.has(chapter.name) ? '▼' : '▶'}
                    </Text>
                    <View style={styles.chapterNumber}>
                      <Text style={styles.chapterNumberText}>{chapterIndex + 1}</Text>
                    </View>
                    <View style={styles.chapterInfo}>
                      <Text style={styles.chapterName}>{chapter.name}</Text>
                      <Text style={styles.chapterMeta}>
                        {chapter.topics.length} topics • {chapter.totalPeriods} periods
                      </Text>
                    </View>
                    <View style={styles.chapterHours}>
                      <Text style={styles.chapterHoursText}>
                        {Math.round(chapter.totalMinutes / 60)} hrs
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {expandedChapters.has(chapter.name) && (
                    <View style={styles.topicsList}>
                      {chapter.topics.map((topic, topicIndex) => (
                        <View key={topic.name} style={styles.topicItem}>
                          <View style={styles.topicHeader}>
                            <View style={styles.topicNumber}>
                              <Text style={styles.topicNumberText}>{topicIndex + 1}</Text>
                            </View>
                            <Text style={styles.topicName}>{topic.name}</Text>
                            <Text style={styles.topicPeriods}>
                              {topic.periods} period{topic.periods > 1 ? 's' : ''}
                            </Text>
                          </View>

                          <View style={styles.objectivesSection}>
                            <Text style={styles.sectionLabel}>🎯 Objectives</Text>
                            {topic.objectives.map((obj, i) => (
                              <Text key={i} style={styles.objectiveItem}>• {obj}</Text>
                            ))}
                          </View>

                          <View style={styles.keyPointsSection}>
                            <Text style={styles.sectionLabel}>📌 Key Points</Text>
                            <View style={styles.keyPointsContainer}>
                              {topic.keyPoints.map((point, i) => (
                                <View key={i} style={styles.keyPointBadge}>
                                  <Text style={styles.keyPointText}>{point}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.pdfButton, generatingPDF && styles.buttonDisabled]}
              onPress={handleSharePDF}
              disabled={generatingPDF}>
              {generatingPDF ? (
                <ActivityIndicator color="#10b981" />
              ) : (
                <Text style={styles.pdfButtonText}>Save to PDF 📄</Text>
              )}
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Picker Modals */}
        {renderPickerModal(
          showClassPicker,
          () => setShowClassPicker(false),
          'Select Class',
          CLASS_OPTIONS.map(c => ({ value: c, label: `Class ${c}` })),
          setSelectedClass,
          selectedClass
        )}
        {renderPickerModal(
          showSubjectPicker,
          () => setShowSubjectPicker(false),
          'Select Subject',
          subjects.map(s => ({ value: s, label: s })),
          setSelectedSubject,
          selectedSubject,
          loadingSubjects
        )}
        {renderPickerModal(
          showChapterPicker,
          () => setShowChapterPicker(false),
          'Select Chapter',
          chapters.map(c => ({ value: c.name, label: c.name })),
          setSelectedChapter,
          selectedChapter,
          loadingChapters
        )}
      </ScrollView>
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: '#ef4444',
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  dropdownArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoItem: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 4,
  },
  resultCard: {
    padding: 20,
    marginTop: 10,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  expandButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  expandBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  expandBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  chaptersContainer: {
    maxHeight: 500,
  },
  chapterItem: {
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  expandIcon: {
    color: '#6366f1',
    fontSize: 12,
    marginRight: 8,
  },
  chapterNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  chapterMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  chapterHours: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  chapterHoursText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
  topicsList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  topicItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#a855f7',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicNumber: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  topicNumberText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  topicName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  topicPeriods: {
    color: '#10b981',
    fontSize: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  objectivesSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 6,
  },
  objectiveItem: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 4,
  },
  keyPointsSection: {},
  keyPointsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keyPointBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  keyPointText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalClose: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 12,
  },
  optionsList: {
    padding: 8,
  },
  optionItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionTextSelected: {
    color: '#818cf8',
    fontWeight: 'bold',
  },
  pdfButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  pdfButtonText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LessonPlansScreen;
