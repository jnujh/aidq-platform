package com.geomsahaejo.scorecard.infrastructure.mq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "diagnosis.exchange";
    public static final String QUEUE = "diagnosis.queue";
    public static final String ROUTING_KEY = "diagnosis.request";

    @Bean
    public DirectExchange diagnosisExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue diagnosisQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    @Bean
    public Binding diagnosisBinding(Queue diagnosisQueue, DirectExchange diagnosisExchange) {
        return BindingBuilder.bind(diagnosisQueue).to(diagnosisExchange).with(ROUTING_KEY);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         JacksonJsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
