package com.upblit.backend.core.org;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class LogoImageProcessor {

    private static final long MAX_LOGO_BYTES = 5L * 1024 * 1024;

    public ProcessedLogo validateAndCropToSquare(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Logo file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Logo must be an image");
        }

        try {
            byte[] bytes = file.getBytes();
            BufferedImage source = ImageIO.read(new ByteArrayInputStream(bytes));

            if (source == null) {
                if (isVectorImage(file.getOriginalFilename(), contentType)) {
                    return validateVectorImage(bytes, file.getOriginalFilename(), contentType);
                }

                throw new IllegalArgumentException("Logo image data is invalid");
            }

            int squareSize = Math.min(source.getWidth(), source.getHeight());
            int x = (source.getWidth() - squareSize) / 2;
            int y = (source.getHeight() - squareSize) / 2;
            BufferedImage square = source.getSubimage(x, y, squareSize, squareSize);

            String outputFormat = resolveOutputFormat(file.getOriginalFilename(), contentType);
            String outputFilename = buildOutputFilename(file.getOriginalFilename(), outputFormat);
            String outputContentType = "image/" + outputFormat;

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            boolean written = ImageIO.write(square, outputFormat, output);
            if (!written) {
                throw new IllegalArgumentException("Unsupported logo image format");
            }

            byte[] processedBytes = output.toByteArray();
            if (processedBytes.length > MAX_LOGO_BYTES) {
                throw new IllegalArgumentException("Processed logo file size exceeds 5MB limit");
            }

            return new ProcessedLogo(processedBytes, outputFilename, outputContentType);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read logo file", ex);
        }
    }

    private ProcessedLogo validateVectorImage(byte[] bytes, String originalFilename, String contentType) {
        if (bytes.length > MAX_LOGO_BYTES) {
            throw new IllegalArgumentException("Processed logo file size exceeds 5MB limit");
        }

        String outputFilename = buildOutputFilename(originalFilename, "svg");
        return new ProcessedLogo(bytes, outputFilename, contentType);
    }

    private boolean isVectorImage(String originalFilename, String contentType) {
        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".svg")) {
            return true;
        }

        return "image/svg+xml".equalsIgnoreCase(contentType);
    }

    private String resolveOutputFormat(String filename, String contentType) {
        if (filename != null) {
            int dot = filename.lastIndexOf('.');
            if (dot >= 0 && dot < filename.length() - 1) {
                String extension = filename.substring(dot + 1).toLowerCase();
                if ("jpg".equals(extension) || "jpeg".equals(extension)) {
                    return "jpg";
                }
                if ("png".equals(extension) || "gif".equals(extension) || "bmp".equals(extension)) {
                    return extension;
                }
            }
        }

        if (contentType != null && contentType.startsWith("image/")) {
            String subtype = contentType.substring("image/".length()).toLowerCase();
            if ("jpeg".equals(subtype)) {
                return "jpg";
            }
            if ("png".equals(subtype) || "gif".equals(subtype) || "bmp".equals(subtype)) {
                return subtype;
            }
        }

        return "png";
    }

    private String buildOutputFilename(String originalFilename, String outputFormat) {
        String base = "logo";
        if (originalFilename != null && !originalFilename.isBlank()) {
            int dot = originalFilename.lastIndexOf('.');
            base = dot > 0 ? originalFilename.substring(0, dot) : originalFilename;
        }

        return base + "." + outputFormat;
    }

    public record ProcessedLogo(byte[] content, String filename, String contentType) {
    }
}