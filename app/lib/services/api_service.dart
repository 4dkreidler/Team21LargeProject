import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://159.203.105.19:5000/api';

  static Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final res = jsonDecode(response.body);
        
        // Strict validation: Must have an ID, ID cannot be "-1", and ID cannot be empty
        return res['id'] != null && 
               res['id'].toString() != "-1" && 
               res['id'].toString().isNotEmpty;
      } 
      return false;
    } catch (e) {
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
      return false;
    }
  }
}