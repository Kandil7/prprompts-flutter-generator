import 'package:equatable/equatable.dart';

/// Profile entity
/// Domain model representing Profile
class Profile extends Equatable {
  final String id;
  final String name;

  const Profile({
    required this.id,
    required this.name,
  });

  @override
  List<Object?> get props => [
    id,
    name,
  ];
}
