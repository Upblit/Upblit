package com.upblit.backend.core.org;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LogoImageProcessorTest {

    private final LogoImageProcessor processor = new LogoImageProcessor();

    @Test
    void shouldRejectEmptyLogoFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "logo.png", "image/png", new byte[0]);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> processor.validateAndCropToSquare(emptyFile)
        );

        assertTrue(ex.getMessage().contains("required"));
    }

    @Test
    void shouldRejectNonImageContentType() {
        MockMultipartFile notImage = new MockMultipartFile("file", "logo.txt", "text/plain", "abc".getBytes());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> processor.validateAndCropToSquare(notImage)
        );

        assertTrue(ex.getMessage().contains("image"));
    }

    @Test
    void shouldRejectInvalidImageBytes() {
        MockMultipartFile invalidImage = new MockMultipartFile(
                "file",
                "logo.png",
                "image/png",
                "not-an-image".getBytes()
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> processor.validateAndCropToSquare(invalidImage)
        );

        assertTrue(ex.getMessage().contains("invalid"));
    }

    @Test
    void shouldCropRectangularLogoToSquare() throws IOException {
        byte[] rectangularPng = createImageBytes(300, 200, "png");
        MockMultipartFile file = new MockMultipartFile("file", "brand-logo.png", "image/png", rectangularPng);

        LogoImageProcessor.ProcessedLogo result = processor.validateAndCropToSquare(file);

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(result.content()));

        assertEquals(200, image.getWidth());
        assertEquals(200, image.getHeight());
        assertEquals("brand-logo.png", result.filename());
        assertEquals("image/png", result.contentType());
    }

    @Test
    void shouldAcceptSvgLogoWithoutRasterCropping() {
        byte[] svgBytes = "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'></svg>".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "brand-logo.svg", "image/svg+xml", svgBytes);

        LogoImageProcessor.ProcessedLogo result = processor.validateAndCropToSquare(file);

        assertEquals("brand-logo.svg", result.filename());
        assertEquals("image/svg+xml", result.contentType());
        assertEquals(svgBytes.length, result.content().length);
    }

    private byte[] createImageBytes(int width, int height, String format) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        graphics.setColor(Color.BLUE);
        graphics.fillRect(0, 0, width, height);
        graphics.dispose();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, format, out);
        return out.toByteArray();
    }
}
