import 'package:equatable/equatable.dart';

/// Valid entity
/// Domain model representing Valid
class Valid extends Equatable {
  final String id;
  final String name;

  const Valid({
    required this.id,
    required this.name,
  });

  @override
  List<Object?> get props => [
    id,
    name,
  ];
}
