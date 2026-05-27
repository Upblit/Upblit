package com.upblit.backend.core.org;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class InviteSchemaInitializer implements CommandLineRunner {

    private final DataSource dataSource;

    public InviteSchemaInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        ensureUserIdColumnIsScalar();
    }

    private void ensureUserIdColumnIsScalar() throws SQLException {
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                     "SELECT data_type, udt_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'invite' AND column_name = 'user_id'"
             );
             ResultSet resultSet = statement.executeQuery()) {

            if (!resultSet.next()) {
                return;
            }

            String dataType = resultSet.getString("data_type");
            String udtName = resultSet.getString("udt_name");
            boolean isArrayColumn = "ARRAY".equalsIgnoreCase(dataType) || "_int8".equalsIgnoreCase(udtName);
            if (!isArrayColumn) {
                return;
            }

            try (PreparedStatement alterStatement = connection.prepareStatement(
                    "ALTER TABLE invite ALTER COLUMN user_id TYPE bigint USING CASE WHEN user_id IS NULL OR cardinality(user_id) = 0 THEN NULL ELSE user_id[1] END"
            )) {
                alterStatement.executeUpdate();
            }
        }
    }
}