import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  // Pointing to your live DigitalOcean server with the /api prefix
  static const String baseUrl = 'http://159.203.105.19:5000/api'; 

  static Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'), 
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email, // Matching the field name in Login.tsx
          'password': password,
        }),
      );

      print('Server Response Status: ${response.statusCode}');
      print('Server Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final res = jsonDecode(response.body);
        // MongoDB returns a String ID; we check that it exists and isn't empty
        return res['id'] != null && res['id'].toString().isNotEmpty;
      } 
      return false;
    } catch (e) {
      print('Connection Error: $e');
      return false;
    }
  }
  
  static Future<bool> register(String email, String password, String firstName, String lastName) async {
     try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'), 
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final res = jsonDecode(response.body);
        return res['error'] == null || res['error'] == "";
      }
      return false;
    } catch (e) {
      print('Register Error: $e');
      return false;
    }
  }
}