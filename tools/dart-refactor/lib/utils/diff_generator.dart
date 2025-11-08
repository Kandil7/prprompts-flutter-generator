import 'dart:math' as math;

/// Generates unified diffs between two strings
class DiffGenerator {
  /// Generate a unified diff between original and modified content
  String generateUnifiedDiff(
    String original,
    String modified,
    String fileName, {
    int contextLines = 3,
  }) {
    final originalLines = original.split('\n');
    final modifiedLines = modified.split('\n');

    final diff = _computeDiff(originalLines, modifiedLines);
    return _formatUnifiedDiff(diff, originalLines, modifiedLines, fileName, contextLines);
  }

  /// Generate a patch that can be applied with git apply
  String generatePatch(
    String original,
    String modified,
    String fileName, {
    String? fromPath,
    String? toPath,
  }) {
    final from = fromPath ?? fileName;
    final to = toPath ?? fileName;

    final buffer = StringBuffer();
    buffer.writeln('diff --git a/$from b/$to');
    buffer.writeln('index 0000000..1111111 100644');
    buffer.writeln('--- a/$from');
    buffer.writeln('+++ b/$to');

    final diff = generateUnifiedDiff(original, modified, fileName);

    // Remove the filename headers from unified diff since we added them above
    final lines = diff.split('\n');
    final contentLines = lines.where((line) =>
      !line.startsWith('---') && !line.startsWith('+++')
    ).join('\n');

    buffer.write(contentLines);

    return buffer.toString();
  }

  /// Compute the differences between two lists of lines
  List<DiffOperation> _computeDiff(List<String> original, List<String> modified) {
    // Using a simplified diff algorithm (could be replaced with Myers' algorithm)
    final operations = <DiffOperation>[];

    // Create LCS table
    final lcs = _computeLCS(original, modified);

    // Backtrack to find the diff operations
    int i = original.length;
    int j = modified.length;

    final reversedOps = <DiffOperation>[];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && original[i - 1] == modified[j - 1]) {
        reversedOps.add(DiffOperation.equal(i - 1, j - 1));
        i--;
        j--;
      } else if (j > 0 && (i == 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        reversedOps.add(DiffOperation.insert(i, j - 1));
        j--;
      } else if (i > 0 && (j == 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
        reversedOps.add(DiffOperation.delete(i - 1, j));
        i--;
      }
    }

    // Reverse to get operations in correct order
    operations.addAll(reversedOps.reversed);

    return operations;
  }

  /// Compute the Longest Common Subsequence table
  List<List<int>> _computeLCS(List<String> original, List<String> modified) {
    final m = original.length;
    final n = modified.length;

    final lcs = List.generate(
      m + 1,
      (_) => List.filled(n + 1, 0),
    );

    for (int i = 1; i <= m; i++) {
      for (int j = 1; j <= n; j++) {
        if (original[i - 1] == modified[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }

    return lcs;
  }

  /// Format the diff operations as a unified diff
  String _formatUnifiedDiff(
    List<DiffOperation> operations,
    List<String> original,
    List<String> modified,
    String fileName,
    int contextLines,
  ) {
    final buffer = StringBuffer();

    // Add file headers
    buffer.writeln('--- $fileName');
    buffer.writeln('+++ $fileName');

    // Group operations into hunks
    final hunks = _groupIntoHunks(operations, contextLines);

    for (final hunk in hunks) {
      _formatHunk(buffer, hunk, original, modified, contextLines);
    }

    return buffer.toString();
  }

  /// Group diff operations into hunks with context
  List<List<DiffOperation>> _groupIntoHunks(List<DiffOperation> operations, int contextLines) {
    final hunks = <List<DiffOperation>>[];
    List<DiffOperation>? currentHunk;
    int lastChangeIndex = -1;

    for (int i = 0; i < operations.length; i++) {
      final op = operations[i];

      if (op.type != DiffOperationType.equal) {
        // This is a change
        if (currentHunk == null || i - lastChangeIndex > contextLines * 2) {
          // Start a new hunk
          if (currentHunk != null) {
            hunks.add(currentHunk);
          }
          currentHunk = [];

          // Add context before the change
          final contextStart = math.max(0, i - contextLines);
          for (int j = contextStart; j < i; j++) {
            currentHunk.add(operations[j]);
          }
        }

        currentHunk.add(op);
        lastChangeIndex = i;
      } else if (currentHunk != null) {
        // Add to current hunk if within context range
        if (i - lastChangeIndex <= contextLines) {
          currentHunk.add(op);
        }
      }
    }

    if (currentHunk != null) {
      hunks.add(currentHunk);
    }

    return hunks;
  }

  /// Format a single hunk
  void _formatHunk(
    StringBuffer buffer,
    List<DiffOperation> hunk,
    List<String> original,
    List<String> modified,
    int contextLines,
  ) {
    if (hunk.isEmpty) return;

    // Calculate hunk range
    int origStart = hunk.first.originalIndex;
    int origCount = 0;
    int modStart = hunk.first.modifiedIndex;
    int modCount = 0;

    for (final op in hunk) {
      switch (op.type) {
        case DiffOperationType.equal:
          origCount++;
          modCount++;
          break;
        case DiffOperationType.delete:
          origCount++;
          break;
        case DiffOperationType.insert:
          modCount++;
          break;
      }
    }

    // Write hunk header
    buffer.writeln('@@ -${origStart + 1},$origCount +${modStart + 1},$modCount @@');

    // Write hunk content
    for (final op in hunk) {
      switch (op.type) {
        case DiffOperationType.equal:
          if (op.originalIndex < original.length) {
            buffer.writeln(' ${original[op.originalIndex]}');
          }
          break;
        case DiffOperationType.delete:
          if (op.originalIndex < original.length) {
            buffer.writeln('-${original[op.originalIndex]}');
          }
          break;
        case DiffOperationType.insert:
          if (op.modifiedIndex < modified.length) {
            buffer.writeln('+${modified[op.modifiedIndex]}');
          }
          break;
      }
    }
  }
}

/// Represents a diff operation
class DiffOperation {
  final DiffOperationType type;
  final int originalIndex;
  final int modifiedIndex;

  DiffOperation({
    required this.type,
    required this.originalIndex,
    required this.modifiedIndex,
  });

  factory DiffOperation.equal(int origIndex, int modIndex) => DiffOperation(
    type: DiffOperationType.equal,
    originalIndex: origIndex,
    modifiedIndex: modIndex,
  );

  factory DiffOperation.insert(int origIndex, int modIndex) => DiffOperation(
    type: DiffOperationType.insert,
    originalIndex: origIndex,
    modifiedIndex: modIndex,
  );

  factory DiffOperation.delete(int origIndex, int modIndex) => DiffOperation(
    type: DiffOperationType.delete,
    originalIndex: origIndex,
    modifiedIndex: modIndex,
  );
}

/// Types of diff operations
enum DiffOperationType {
  equal,
  insert,
  delete,
}