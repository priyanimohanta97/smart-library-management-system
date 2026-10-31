package com.library.management;

import com.library.management.config.MongoTestServerConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(MongoTestServerConfig.class)
class LibraryManagementSystemApplicationTests {

    @Test
    void contextLoads() {
    }

}
