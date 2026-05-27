package com.upblit.backend.Library;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

@Service
public class SupabaseService {

    @Value("${supabase.uri}")
    private String SUPABASE_URL;

    @Value("${supabase.api.key}")
    private String API_KEY;

    public String uploadFile(MultipartFile file,String BUCKET) throws Exception {
        return uploadFile(file.getBytes(), file.getOriginalFilename(), file.getContentType(), BUCKET);
    }

    public String uploadFile(byte[] fileBytes, String originalFilename, String contentType, String BUCKET) throws Exception {

        // ✅ generate random filename
        String safeFileName = (originalFilename == null || originalFilename.isBlank()) ? "file" : originalFilename;
        String safeContentType = (contentType == null || contentType.isBlank()) ? "application/octet-stream" : contentType;
        String fileName = UUID.randomUUID() + "_" + safeFileName;
        String path = "uploads/" + fileName;

        URL url = new URL(SUPABASE_URL + "/storage/v1/object/" + BUCKET + "/" + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setDoOutput(true);
        conn.setRequestMethod("POST");

        conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
        conn.setRequestProperty("apikey", API_KEY);
        conn.setRequestProperty("Content-Type", safeContentType);

        // upload file
        OutputStream os = conn.getOutputStream();
        os.write(fileBytes);
        os.flush();
        os.close();

        int responseCode = conn.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            return SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/" + path;
        } else {
            throw new RuntimeException("Upload failed: " + responseCode);
        }
    }
    public void deleteFile(String fileUrl) throws Exception {
        String[] parts = extractBucketAndPath(fileUrl);
        String bucket = parts[0];
        String path = parts[1];

        URL url = new URL(SUPABASE_URL + "/storage/v1/object/" + bucket + "/" + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("DELETE");
        conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
        conn.setRequestProperty("apikey", API_KEY);

        int responseCode = conn.getResponseCode();

        if (responseCode < 200 || responseCode >= 300) {
            throw new RuntimeException("Delete failed: " + responseCode);
        }
    }

    public static String[] extractBucketAndPath(String fileUrl) {
        String marker = "/storage/v1/object/public/";
        int idx = fileUrl.indexOf(marker);

        if (idx == -1) {
            throw new IllegalArgumentException("Invalid Supabase public URL");
        }

        String remaining = fileUrl.substring(idx + marker.length());
        int slashIndex = remaining.indexOf('/');

        if (slashIndex == -1) {
            throw new IllegalArgumentException("Invalid file URL format");
        }

        String bucket = remaining.substring(0, slashIndex);
        String path = remaining.substring(slashIndex + 1);

        return new String[]{bucket, path};
    }
}