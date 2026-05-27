package com.upblit.backend.ai.docs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DocsSender {

    @Autowired
    private RestTemplate restTemplate;
    private String fast_api_key="https://da69c6c6-b2ca-4505-8aaf-83450a806760.mock.pstmn.io";
    private String fast_api_uri="https://da69c6c6-b2ca-4505-8aaf-83450a806760.mock.pstmn.io";
    public String docs_send( DocsUploadDTO docsUploadDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-KEY", fast_api_key);
        HttpEntity<DocsUploadDTO> requestEntity =
                new HttpEntity<>(docsUploadDTO, headers);
        return restTemplate.postForObject(fast_api_uri+"/add_doc", requestEntity, String.class);
    }
    public ResponseEntity<String> docs_delete(DocsDeleteDTO docsDeleteDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-KEY", fast_api_key);
        HttpEntity<DocsDeleteDTO> requestEntity =
                new HttpEntity<>(docsDeleteDTO, headers);
        return restTemplate.exchange(
                fast_api_uri + "/delete_doc",
                HttpMethod.DELETE,
                requestEntity,
                String.class
        );
    }

}
