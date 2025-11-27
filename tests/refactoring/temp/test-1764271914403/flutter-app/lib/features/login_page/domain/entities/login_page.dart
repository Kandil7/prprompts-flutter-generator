import 'package:equatable/equatable.dart';

/// LoginPage entity
/// Domain model representing LoginPage
class LoginPage extends Equatable {
  final String id;
  final String name;

  const LoginPage({
    required this.id,
    required this.name,
  });

  @override
  List<Object?> get props => [
    id,
    name,
  ];
}
