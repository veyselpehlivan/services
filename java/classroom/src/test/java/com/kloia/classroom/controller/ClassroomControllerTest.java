package com.kloia.classroom.controller;

import com.kloia.classroom.model.Classroom;
import com.kloia.classroom.service.ClassroomService;
import org.junit.Before;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

@AutoConfigureMockMvc
@SpringBootTest
@ExtendWith(SpringExtension.class)
class ClassroomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    protected WebApplicationContext wac;

    @InjectMocks
    private ClassroomController classroomController;

    @Mock
    private ClassroomService classroomService;

    private List<Classroom> classrooms;

    @Before
    public void setup() {
        this.mockMvc = standaloneSetup(this.classroomController).build();
        Classroom classroom = Classroom.builder().id(13).name("Veysel").code("comp").teacherId(13).build();
        Classroom classroom2 = Classroom.builder().id(13).name("Hiko").code("comp").teacherId(13).build();

        classrooms = new ArrayList<>();
        classrooms.add(classroom);
        classrooms.add(classroom2);
    }

    @Test
    void testSearchSync() throws Exception {

        // Mocking service
        when(classroomService.getAllClassroom()).thenReturn(classrooms);

        mockMvc.perform(get("/classroom").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();
    }
}