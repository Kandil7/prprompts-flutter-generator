import 'package:equatable/equatable.dart';

/// LargeComponent entity
/// Domain model representing LargeComponent
class LargeComponent extends Equatable {
  final String id;
  final String name;

  const LargeComponent({
    required this.id,
    required this.name,
  });

  @override
  List<Object?> get props => [
    id,
    name,
  ];
}
