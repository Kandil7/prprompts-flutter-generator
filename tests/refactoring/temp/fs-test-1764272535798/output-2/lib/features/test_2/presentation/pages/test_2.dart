import 'package:flutter/material.dart';

class Test2Widget extends StatelessWidget {
  const Test2Widget({
    Key? key,
  }) : super(key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test2Widget'),
      ),
      body: Center(
        child: const Text('Test2Widget'),
      ),
    );
  }
}
