package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.Role;     
import com.supermercado.supermercado_backend.models.ERole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}