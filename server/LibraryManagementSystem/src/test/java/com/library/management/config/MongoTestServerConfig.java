package com.library.management.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import de.bwaldvogel.mongo.MongoServer;
import de.bwaldvogel.mongo.MongoVersion;
import de.bwaldvogel.mongo.backend.memory.MemoryBackend;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

import java.util.List;

@TestConfiguration(proxyBeanMethods = false)
public class MongoTestServerConfig {

    private static MongoServer mongoServer;

    @Bean(destroyMethod = "shutdown")
    public MongoServer mongoServer() {
        synchronized (MongoTestServerConfig.class) {
            if (mongoServer == null) {
                MemoryBackend backend = new MemoryBackend();
                backend.version(new MongoVersion() {
                    @Override
                    public List<Integer> getVersionArray() {
                        return List.of(4, 4, 0);
                    }

                    @Override
                    public int getWireVersion() {
                        return 9;
                    }
                });
                mongoServer = new MongoServer(backend);
                mongoServer.bind();
                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    if (mongoServer != null) {
                        mongoServer.shutdown();
                    }
                }));
            }
        }
        return mongoServer;
    }

    @Bean(destroyMethod = "close")
    @Primary
    public MongoClient mongoClient(MongoServer server) {
        return MongoClients.create(server.getConnectionString());
    }

    @Bean
    @Primary
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        return new SimpleMongoClientDatabaseFactory(mongoClient, "test_library_db");
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDatabaseFactory) {
        return new MongoTemplate(mongoDatabaseFactory);
    }
}
