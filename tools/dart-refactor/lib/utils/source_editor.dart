/// Manages source code edits
class SourceEditor {
  final String _originalContent;
  final List<SourceEdit> _appliedEdits = [];
  String _currentContent;

  SourceEditor(this._originalContent) : _currentContent = _originalContent;

  /// Apply a list of edits to the source
  void applyEdits(List<SourceEdit> edits) {
    if (edits.isEmpty) return;

    // Sort edits by offset in descending order to avoid offset shifts
    final sortedEdits = List<SourceEdit>.from(edits)
      ..sort((a, b) => b.offset.compareTo(a.offset));

    for (final edit in sortedEdits) {
      _applyEdit(edit);
      _appliedEdits.add(edit);
    }
  }

  /// Apply a single edit
  void _applyEdit(SourceEdit edit) {
    if (edit.offset < 0 || edit.offset > _currentContent.length) {
      throw ArgumentError('Edit offset ${edit.offset} is out of range');
    }

    if (edit.offset + edit.length > _currentContent.length) {
      throw ArgumentError('Edit range exceeds content length');
    }

    final before = _currentContent.substring(0, edit.offset);
    final after = _currentContent.substring(edit.offset + edit.length);
    _currentContent = before + edit.replacement + after;
  }

  /// Get the current content after applying edits
  String getContent() => _currentContent;

  /// Get the original content
  String getOriginalContent() => _originalContent;

  /// Get all applied edits
  List<SourceEdit> getAllEdits() => List.unmodifiable(_appliedEdits);

  /// Reset to original content
  void reset() {
    _currentContent = _originalContent;
    _appliedEdits.clear();
  }

  /// Check if any edits have been applied
  bool get hasEdits => _appliedEdits.isNotEmpty;

  /// Get the total number of edits
  int get editCount => _appliedEdits.length;

  /// Calculate the net change in content length
  int get netLengthChange {
    int change = 0;
    for (final edit in _appliedEdits) {
      change += edit.replacement.length - edit.length;
    }
    return change;
  }

  /// Merge overlapping or adjacent edits
  static List<SourceEdit> mergeEdits(List<SourceEdit> edits) {
    if (edits.isEmpty) return edits;

    // Sort by offset
    final sorted = List<SourceEdit>.from(edits)
      ..sort((a, b) => a.offset.compareTo(b.offset));

    final merged = <SourceEdit>[];
    SourceEdit? current = sorted.first;

    for (int i = 1; i < sorted.length; i++) {
      final next = sorted[i];

      if (current.offset + current.length >= next.offset) {
        // Overlapping or adjacent edits - merge them
        final endOffset = (current.offset + current.length)
            .compareTo(next.offset + next.length) > 0
            ? current.offset + current.length
            : next.offset + next.length;

        current = SourceEdit(
          offset: current.offset,
          length: endOffset - current.offset,
          replacement: current.replacement + next.replacement,
        );
      } else {
        // Non-overlapping - add current and move to next
        merged.add(current);
        current = next;
      }
    }

    merged.add(current);
    return merged;
  }

  /// Validate that edits don't conflict
  static bool validateEdits(List<SourceEdit> edits) {
    if (edits.length <= 1) return true;

    // Sort by offset
    final sorted = List<SourceEdit>.from(edits)
      ..sort((a, b) => a.offset.compareTo(b.offset));

    // Check for overlaps
    for (int i = 0; i < sorted.length - 1; i++) {
      final current = sorted[i];
      final next = sorted[i + 1];

      if (current.offset + current.length > next.offset) {
        // Overlapping edits
        return false;
      }
    }

    return true;
  }
}

/// Represents a single source code edit
class SourceEdit {
  final int offset;
  final int length;
  final String replacement;

  const SourceEdit({
    required this.offset,
    required this.length,
    required this.replacement,
  });

  /// Create an insertion edit
  factory SourceEdit.insert(int offset, String text) => SourceEdit(
    offset: offset,
    length: 0,
    replacement: text,
  );

  /// Create a deletion edit
  factory SourceEdit.delete(int offset, int length) => SourceEdit(
    offset: offset,
    length: length,
    replacement: '',
  );

  /// Create a replacement edit
  factory SourceEdit.replace(int offset, int length, String text) => SourceEdit(
    offset: offset,
    length: length,
    replacement: text,
  );

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
    'offset': offset,
    'length': length,
    'replacement': replacement,
  };

  /// Create from JSON
  factory SourceEdit.fromJson(Map<String, dynamic> json) => SourceEdit(
    offset: json['offset'] as int,
    length: json['length'] as int,
    replacement: json['replacement'] as String,
  );

  /// Check if this is an insertion
  bool get isInsertion => length == 0 && replacement.isNotEmpty;

  /// Check if this is a deletion
  bool get isDeletion => length > 0 && replacement.isEmpty;

  /// Check if this is a replacement
  bool get isReplacement => length > 0 && replacement.isNotEmpty;

  /// Check if this is a no-op
  bool get isNoOp => length == 0 && replacement.isEmpty;

  /// Get the end offset of this edit
  int get endOffset => offset + length;

  @override
  String toString() => 'SourceEdit(offset: $offset, length: $length, replacement: "${replacement.length > 20 ? '${replacement.substring(0, 20)}...' : replacement}")';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SourceEdit &&
          offset == other.offset &&
          length == other.length &&
          replacement == other.replacement;

  @override
  int get hashCode => Object.hash(offset, length, replacement);
}