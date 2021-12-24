package com.kloia.classroom.repository;

import com.kloia.classroom.model.Classroom;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@DataJpaTest
class ClassroomRepositoryTest {

    @Autowired
    private ClassroomRepository classroomRepository;

    @Test
    void shouldSave() {
        Classroom classroom = Classroom.builder().id(13).name("Veysel").code("comp").teacherId(13).build();

        classroomRepository.save(classroom);

        assertEquals(Collections.singletonList(classroom), classroomRepository.findAll());
    }

}